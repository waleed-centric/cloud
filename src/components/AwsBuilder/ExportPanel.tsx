import React, { useState } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

// Summary: Export Panel component - handles export to Draw.io format
// - Generates XML compatible with Draw.io/diagrams.net

export function ExportPanel() {
  const { state } = useAwsBuilder();
  const [isExporting, setIsExporting] = useState(false);
  // return false
  // Build grouped JSON: merge nodes by same name or same parentNodeId
  const buildRequestedJSONFormat = () => {
    const sanitize = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

    const stripNullsDeep = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined;
      if (Array.isArray(obj)) {
        const arr = obj.map(stripNullsDeep).filter((v) => v !== undefined);
        return arr;
      }
      if (typeof obj === 'object') {
        const out: any = {};
        Object.keys(obj).forEach((k) => {
          const v = stripNullsDeep((obj as any)[k]);
          if (v !== undefined) out[k] = v;
        });
        return out;
      }
      return obj;
    };

    const ensureArrayUnique = (arr: any[]) => {
      const seen = new Set<string>();
      const out: any[] = [];
      for (const v of arr) {
        const key = typeof v === 'object' ? JSON.stringify(v) : String(v);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(v);
        }
      }
      return out;
    };

    const mergeValues = (a: any, b: any) => {
      if (a === undefined) return b;
      if (b === undefined) return a;
      if (Array.isArray(a) && Array.isArray(b)) return ensureArrayUnique([...a, ...b]);
      if (Array.isArray(a)) return ensureArrayUnique([...a, b]);
      if (Array.isArray(b)) return ensureArrayUnique([a, ...b]);
      if (typeof a === 'object' && typeof b === 'object') return b; // last-wins for complex objects
      if (a === b) return a;
      // different scalars -> unique list
      return ensureArrayUnique([a, b]);
    };

    const mergeProps = (target: Record<string, any>, source: Record<string, any>) => {
      const keys = new Set([...Object.keys(target), ...Object.keys(source)]);
      const out: Record<string, any> = {};
      for (const k of keys) {
        out[k] = mergeValues((target as any)[k], (source as any)[k]);
      }
      return out;
    };

    // Simple DSU implementation for grouping by name OR parentNodeId
    class DSU {
      parent: number[];
      rank: number[];
      constructor(n: number) {
        this.parent = Array(n).fill(0).map((_, i) => i);
        this.rank = Array(n).fill(0);
      }
      find(x: number): number {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
      }
      union(a: number, b: number) {
        const ra = this.find(a);
        const rb = this.find(b);
        if (ra === rb) return;
        if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
        else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
        else {
          this.parent[rb] = ra;
          this.rank[ra]++;
        }
      }
    }

    type Item = {
      nodeId: string;
      parentId?: string;
      nameTag: string;
      sanitizedName: string;
      properties: Record<string, any>;
    };

    const groupItems = (items: Item[]): Item[][] => {
      const dsu = new DSU(items.length);
      const byName = new Map<string, number[]>();
      const byParent = new Map<string, number[]>();
      items.forEach((item, idx) => {
        const n = item.sanitizedName;
        if (n) {
          const arr = byName.get(n) || [];
          arr.push(idx);
          byName.set(n, arr);
        }
        if (item.parentId) {
          const arr = byParent.get(item.parentId) || [];
          arr.push(idx);
          byParent.set(item.parentId, arr);
        }
      });
      // Union by same name
      for (const arr of byName.values()) {
        for (let i = 1; i < arr.length; i++) dsu.union(arr[0], arr[i]);
      }
      // Union by same parent
      for (const arr of byParent.values()) {
        for (let i = 1; i < arr.length; i++) dsu.union(arr[0], arr[i]);
      }
      // Collect groups
      const groupsMap = new Map<number, Item[]>();
      items.forEach((item, idx) => {
        const root = dsu.find(idx);
        const list = groupsMap.get(root) || [];
        list.push(item);
        groupsMap.set(root, list);
      });
      return Array.from(groupsMap.values());
    };

    // --- EC2 Instances ---
    const ec2Nodes = state.placedNodes.filter((node) => node.subServiceId === 'ec2-instance' || node.icon.id === 'ec2-instance');
    const ec2Items: Item[] = ec2Nodes.map((node) => {
      const ami = (node as any)?.properties?.ami || '';
      const instanceType = (node as any)?.properties?.instanceType || '';
      const keyName = (node as any)?.properties?.keyPair || '';
      const securityGroups: string[] = Array.isArray((node as any)?.properties?.securityGroups)
        ? (node as any).properties.securityGroups
        : [];
      // Convert SG names to Terraform references for ids
      const sgRefs = securityGroups.map((sg) => ({ __ref: `aws_security_group.${sanitize(sg)}.id` }));

      const resolveSubnetIdForInstance = (ec2NodeId: string): string => {
        for (const conn of state.connections) {
          let otherNodeId: string | null = null;
          if (conn.fromNodeId === ec2NodeId) otherNodeId = conn.toNodeId;
          else if (conn.toNodeId === ec2NodeId) otherNodeId = conn.fromNodeId;
          if (!otherNodeId) continue;

          const other = state.placedNodes.find((n) => n.id === otherNodeId);
          if (!other) continue;
          const isSubnet = other.subServiceId === 'vpc-subnet' || other.icon.id === 'vpc-subnet';
          if (isSubnet) {
            const props: any = (other as any)?.properties || {};
            return props.subnetId || props.subnetName || props.subnetCidr || '';
          }
        }
        return '';
      };

      let parentName: string | undefined = undefined;
      const parentId = (node as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeName = (parent as any)?.properties?.name;
        if (typeof maybeName === 'string' && maybeName.trim()) parentName = maybeName.trim();
      }
      const nameTag = parentName || node.icon.name || 'web_server';
      const sanitizedName = sanitize(nameTag);
      // Pull EBS sub-service properties under same parent to enrich EC2 export
      let volumeType: string | undefined;
      let size: number | string | undefined;
      let encrypted: boolean | undefined;
      if (parentId) {
        const ebsNode = state.placedNodes.find(
          (n) => (n.subServiceId === 'ebs-volume' || n.icon.id === 'ebs-volume') && (n as any)?.parentNodeId === parentId
        );
        if (ebsNode) {
          const eProps: any = (ebsNode as any)?.properties || {};
          if (typeof eProps.volumeType === 'string' && eProps.volumeType) volumeType = eProps.volumeType;
          if (typeof eProps.size === 'number' || typeof eProps.size === 'string') size = eProps.size;
          if (typeof eProps.encrypted === 'boolean') encrypted = eProps.encrypted;
        }
      }
      const properties = {
        ami,
        instance_type: instanceType,
        subnet_id: resolveSubnetIdForInstance(node.id),
        key_name: keyName,
        securityGroups: sgRefs,
        // Volume-related keys will be normalized into root_block_device later
        volumeType,
        size,
        encrypted,
        tags: {
          Name: nameTag,
        },
      } as Record<string, any>;
      return { nodeId: node.id, parentId, nameTag, sanitizedName, properties };
    });
    const ec2Groups = groupItems(ec2Items);
    const ec2Resources = ec2Groups.map((group) => {
      const mergedProps = group.reduce((acc, it) => mergeProps(acc, it.properties), {} as Record<string, any>);
      const nameTag = group[0]?.nameTag || 'ec2_instance';
      return { type: 'aws_instance', name: sanitize(nameTag), properties: stripNullsDeep(mergedProps) };
    });

    // --- Security Groups ---
    const parseInboundRules = (text: any): Array<Record<string, any>> => {
      if (typeof text !== 'string') return [];
      const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
      const rules: Array<Record<string, any>> = [];
      for (const p of parts) {
        // Parse patterns like "SSH: 22" or "HTTP: 80" or just "22"
        let port: number | undefined;
        const match = p.match(/(\d{1,5})/);
        if (match) {
          const portStr = match[1];
          const parsed = parseInt(portStr, 10);
          if (!isNaN(parsed)) port = parsed;
        }
        if (port !== undefined) {
          rules.push({ from_port: port, to_port: port, protocol: 'tcp', cidr_blocks: ['0.0.0.0/0'] });
        }
      }
      return rules;
    };
    const sgNodes = state.placedNodes.filter(
      (n) => (n.subServiceId === 'security-group' || n.icon.id === 'security-group')
    );
    const sgItems: Item[] = sgNodes.map((node) => {
      const parentId = (node as any)?.parentNodeId;
      let parentName: string | undefined = undefined;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeName = (parent as any)?.properties?.name;
        if (typeof maybeName === 'string' && maybeName.trim()) parentName = maybeName.trim();
      }
      const groupName = (node as any)?.properties?.groupName || node.icon.name || 'security-group';
      const inboundRules = (node as any)?.properties?.inboundRules || '';
      const nameTag = groupName;
      const sanitizedName = sanitize(nameTag);
      const ingress = parseInboundRules(inboundRules);
      const egress = [{ from_port: 0, to_port: 0, protocol: '-1', cidr_blocks: ['0.0.0.0/0'] }];
      const properties: Record<string, any> = {
        name: groupName,
        ...(ingress.length ? { ingress } : {}),
        egress,
        tags: parentName ? { Parent: parentName } : undefined,
      };
      return { nodeId: (node as any).id, parentId, nameTag, sanitizedName, properties };
    });
    const sgGroups = groupItems(sgItems);
    const securityGroupResources = sgGroups.map((group) => {
      const mergedProps = group.reduce((acc, it) => mergeProps(acc, it.properties), {} as Record<string, any>);
      const nameTag = group[0]?.nameTag || 'security_group';
      return { type: 'aws_security_group', name: sanitize(nameTag), properties: stripNullsDeep(mergedProps) };
    });

    // --- Elastic IPs + Associations ---
    const eipNodes = state.placedNodes.filter(
      (n) => (n.subServiceId === 'elastic-ip' || n.icon.id === 'elastic-ip')
    );
    const eipItems: Item[] = eipNodes.map((node) => {
      const parentId = (node as any)?.parentNodeId;
      let parentName: string | undefined = undefined;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeName = (parent as any)?.properties?.name;
        if (typeof maybeName === 'string' && maybeName.trim()) parentName = maybeName.trim();
      }
      const nameTag = parentName || node.icon.name || 'elastic_ip';
      const sanitizedName = sanitize(nameTag);
      const domainProp = (node as any)?.properties?.domain;
      const domain = typeof domainProp === 'string' ? domainProp : 'vpc';
      const properties: Record<string, any> = {
        vpc: domain === 'vpc',
        tags: parentName ? { Parent: parentName } : undefined,
      };
      return { nodeId: (node as any).id, parentId, nameTag, sanitizedName, properties };
    });
    const eipGroups = groupItems(eipItems);
    const eipResources = eipGroups.map((group) => {
      const mergedProps = group.reduce((acc, it) => mergeProps(acc, it.properties), {} as Record<string, any>);
      const nameTag = group[0]?.nameTag || 'elastic_ip';
      const resName = sanitize(nameTag);
      const eipRes = { type: 'aws_eip', name: resName, properties: stripNullsDeep(mergedProps) };
      // Create association to EC2 instance with matching name if present
      const assoc = {
        type: 'aws_eip_association',
        name: sanitize(`${nameTag}_assoc`),
        properties: {
          allocation_id: { __ref: `aws_eip.${resName}.id` },
          instance_id: { __ref: `aws_instance.${sanitize(nameTag)}.id` },
        },
      };
      return [eipRes, assoc];
    }).flat();

    // --- S3 Buckets (Terraform v5 split resources) ---
    const s3Nodes = state.placedNodes.filter((node) => node.subServiceId === 's3-bucket' || node.icon.id === 's3-bucket');
    const s3Items: Item[] = s3Nodes.map((node) => {
      let bucketName: string = '';
      const parentId = (node as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeBucket = (parent as any)?.properties?.bucketName;
        if (typeof maybeBucket === 'string' && maybeBucket.trim()) bucketName = maybeBucket.trim();
      }
      if (!bucketName) {
        const maybeOwnBucket = (node as any)?.properties?.bucketName;
        if (typeof maybeOwnBucket === 'string' && maybeOwnBucket.trim()) bucketName = maybeOwnBucket.trim();
      }
      if (!bucketName) bucketName = 'my-s3-bucket';

      const p: any = (node as any)?.properties || {};
      const storageClass = p.storageClass || 'STANDARD'; // informational
      const versioning = Boolean(p.versioning);
      const blockPublic = typeof p.publicAccess === 'boolean' ? p.publicAccess : true;
      const forceDestroy = Boolean(p.forceDestroy);
      const acl = typeof p.acl === 'string' && p.acl ? p.acl : undefined;
      const acceleration = Boolean(p.acceleration);
      const sseAlgorithm = typeof p.sseAlgorithm === 'string' ? p.sseAlgorithm : '';
      const kmsKeyId = typeof p.kmsKeyId === 'string' ? p.kmsKeyId : '';
      const bucketKeyEnabled = Boolean(p.bucketKeyEnabled);
      const loggingBucket = typeof p.loggingBucket === 'string' ? p.loggingBucket : '';
      const loggingPrefix = typeof p.loggingPrefix === 'string' ? p.loggingPrefix : '';
      const corsAllowedOrigins = typeof p.corsAllowedOrigins === 'string' ? p.corsAllowedOrigins : '';
      const corsAllowedMethods = typeof p.corsAllowedMethods === 'string' ? p.corsAllowedMethods : '';
      const corsAllowedHeaders = typeof p.corsAllowedHeaders === 'string' ? p.corsAllowedHeaders : '';
      const corsExposeHeaders = typeof p.corsExposeHeaders === 'string' ? p.corsExposeHeaders : '';
      const corsMaxAgeSeconds = typeof p.corsMaxAgeSeconds === 'number' ? p.corsMaxAgeSeconds : 0;
      const websiteIndexDocument = typeof p.websiteIndexDocument === 'string' ? p.websiteIndexDocument : '';
      const websiteErrorDocument = typeof p.websiteErrorDocument === 'string' ? p.websiteErrorDocument : '';

      // lifecycle via separate sub-service if present
      let lifecycle: { transition_days?: number; expiration_days?: number } | undefined;
      if (parentId) {
        const lifecycleNode = state.placedNodes.find(
          (n) => (n.subServiceId === 's3-lifecycle' || n.icon.id === 's3-lifecycle') && n.parentNodeId === parentId
        );
        if (lifecycleNode) {
          const t = (lifecycleNode as any)?.properties?.transitionDays;
          const e = (lifecycleNode as any)?.properties?.expirationDays;
          const transition_days = typeof t === 'number' ? t : undefined;
          const expiration_days = typeof e === 'number' ? e : undefined;
          if (transition_days !== undefined || expiration_days !== undefined) lifecycle = { transition_days, expiration_days };
        }
      }

      const nameTag = bucketName;
      const sanitizedName = sanitize(bucketName);
      const properties = {
        bucket: bucketName,
        force_destroy: forceDestroy,
        block_public_access: blockPublic,
        versioning_enabled: versioning,
        acl,
        acceleration,
        storage_class: storageClass,
        sse: { algorithm: sseAlgorithm, kms_key_id: kmsKeyId, bucket_key_enabled: bucketKeyEnabled },
        logging: { bucket: loggingBucket, prefix: loggingPrefix },
        cors: { allowed_origins: corsAllowedOrigins, allowed_methods: corsAllowedMethods, allowed_headers: corsAllowedHeaders, expose_headers: corsExposeHeaders, max_age_seconds: corsMaxAgeSeconds },
        website: { index_document: websiteIndexDocument, error_document: websiteErrorDocument },
        lifecycle,
        tags: { Name: bucketName, Environment: 'Production' },
      } as Record<string, any>;
      return { nodeId: node.id, parentId, nameTag, sanitizedName, properties };
    });
    const s3Groups = groupItems(s3Items);
    const s3BucketResources = s3Groups.map((group) => {
      const merged = group.reduce((acc, it) => mergeProps(acc, it.properties), {} as Record<string, any>);
      const nameTag = group[0]?.nameTag || 'my_s3_bucket';
      const resName = sanitize(nameTag);

      // Base bucket
      const out: any[] = [];
      out.push({ type: 'aws_s3_bucket', name: resName, properties: stripNullsDeep({
        bucket: merged.bucket,
        force_destroy: merged.force_destroy || false,
        tags: merged.tags,
      })});

      // Public access block
      out.push({ type: 'aws_s3_bucket_public_access_block', name: resName, properties: stripNullsDeep({
        bucket: { __ref: `aws_s3_bucket.${resName}.id` },
        block_public_acls: !!merged.block_public_access,
        ignore_public_acls: !!merged.block_public_access,
        block_public_policy: !!merged.block_public_access,
        restrict_public_buckets: !!merged.block_public_access,
      })});
      
      // Ownership controls + ACL (when ACL provided)
      if (merged.acl) {
        out.push({ type: 'aws_s3_bucket_ownership_controls', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          rule: { object_ownership: 'BucketOwnerPreferred' },
        })});
        out.push({ type: 'aws_s3_bucket_acl', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          acl: merged.acl,
          depends_on: [
            { __ref: `aws_s3_bucket_public_access_block.${resName}` },
            { __ref: `aws_s3_bucket_ownership_controls.${resName}` },
          ],
        })});
      }

      // Versioning
      if (typeof merged.versioning_enabled === 'boolean') {
        out.push({ type: 'aws_s3_bucket_versioning', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          versioning_configuration: { status: merged.versioning_enabled ? 'Enabled' : 'Suspended' },
        })});
      }

      // Acceleration
      if (merged.acceleration) {
        out.push({ type: 'aws_s3_bucket_accelerate', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          accelerate_status: 'Enabled',
        })});
      }

      // SSE configuration
      if (merged.sse && (merged.sse.algorithm || merged.sse.kms_key_id)) {
        const sseProps: any = { bucket: { __ref: `aws_s3_bucket.${resName}.id` }, rule: { apply_server_side_encryption_by_default: {} } };
        if (merged.sse.algorithm) sseProps.rule.apply_server_side_encryption_by_default.sse_algorithm = merged.sse.algorithm;
        if (merged.sse.kms_key_id) sseProps.rule.apply_server_side_encryption_by_default.kms_master_key_id = merged.sse.kms_key_id;
        out.push({ type: 'aws_s3_bucket_server_side_encryption_configuration', name: resName, properties: stripNullsDeep(sseProps) });
      }

      // Logging
      if (merged.logging && merged.logging.bucket) {
        out.push({ type: 'aws_s3_bucket_logging', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          target_bucket: merged.logging.bucket,
          target_prefix: merged.logging.prefix || undefined,
        })});
      }

      // CORS
      if (merged.cors && (merged.cors.allowed_origins || merged.cors.allowed_methods || merged.cors.allowed_headers)) {
        // Allow comma-separated strings from UI
        const split = (v: any) => typeof v === 'string' ? v.split(',').map((x: string) => x.trim()).filter(Boolean) : v;
        out.push({ type: 'aws_s3_bucket_cors_configuration', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          cors_rule: {
            allowed_origins: split(merged.cors.allowed_origins) || ['*'],
            allowed_methods: split(merged.cors.allowed_methods) || ['GET'],
            allowed_headers: split(merged.cors.allowed_headers) || undefined,
            expose_headers: split(merged.cors.expose_headers) || undefined,
            max_age_seconds: typeof merged.cors.max_age_seconds === 'number' ? merged.cors.max_age_seconds : undefined,
          },
        })});
      }

      // Website
      if (merged.website && (merged.website.index_document || merged.website.error_document)) {
        out.push({ type: 'aws_s3_bucket_website_configuration', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          index_document: merged.website.index_document || undefined,
          error_document: merged.website.error_document || undefined,
        })});
      }

      // Lifecycle
      if (merged.lifecycle && (merged.lifecycle.transition_days || merged.lifecycle.expiration_days)) {
        const rule: any = { id: 'default', status: 'Enabled' };
        if (merged.lifecycle.transition_days) rule.transition = { days: merged.lifecycle.transition_days, storage_class: 'STANDARD_IA' };
        if (merged.lifecycle.expiration_days) rule.expiration = { days: merged.lifecycle.expiration_days };
        out.push({ type: 'aws_s3_bucket_lifecycle_configuration', name: resName, properties: stripNullsDeep({
          bucket: { __ref: `aws_s3_bucket.${resName}.id` },
          rule,
        })});
      }

      return out;
    });

    // --- VPCs ---
    const vpcRootNodes = state.placedNodes.filter(
      (node) => (((node as any)?.serviceId === 'vpc' && !(node as any)?.subServiceId) || node.icon.id === 'vpc')
    );
    let vpcCandidates: any[] = [...vpcRootNodes];
    if (vpcCandidates.length === 0) {
      const vpcParents = new Map<string, any>();
      state.placedNodes.forEach((n) => {
        const isVpcChild =
          n.subServiceId === 'vpc-subnet' ||
          n.subServiceId === 'internet-gateway' ||
          n.subServiceId === 'route-table' ||
          n.icon.id === 'vpc-subnet' ||
          n.icon.id === 'internet-gateway' ||
          n.icon.id === 'route-table';
        if (isVpcChild) {
          const pid = (n as any)?.parentNodeId;
          if (pid) {
            const parent = state.placedNodes.find((m) => m.id === pid);
            if (parent && (((parent as any)?.serviceId === 'vpc' && !(parent as any)?.subServiceId) || parent.icon.id === 'vpc')) {
              vpcParents.set(pid, parent);
            }
          }
        }
      });
      vpcCandidates = Array.from(vpcParents.values());
    }

    const vpcItems: Item[] = vpcCandidates.map((vpcNode: any) => {
      const vpcName = vpcNode?.properties?.vpcName || vpcNode.icon?.name || 'MyVPC';
      const cidrBlock = vpcNode?.properties?.cidrBlock || '10.0.0.0/16';
      const parentId = (vpcNode as any)?.parentNodeId;
      const sanitizedName = sanitize(vpcName);
      const properties = {
        cidr_block: cidrBlock,
        enable_dns_hostnames: true,
        tags: { Name: vpcName },
      } as Record<string, any>;
      return { nodeId: vpcNode.id, parentId, nameTag: vpcName, sanitizedName, properties };
    });
    const vpcGroups = groupItems(vpcItems);
    const vpcResources = vpcGroups.map((group) => {
      const mergedProps = group.reduce((acc, it) => mergeProps(acc, it.properties), {} as Record<string, any>);
      const nameTag = group[0]?.nameTag || 'vpc';
      return { type: 'aws_vpc', name: sanitize(nameTag), properties: stripNullsDeep(mergedProps) };
    });

    // --- CloudFront ---
    const cfNodes = state.placedNodes.filter((node) => node.subServiceId === 'cf-distribution' || node.icon.id === 'cf-distribution');
    const cfItems: Item[] = cfNodes.map((node) => {
      let distributionName: string = '';
      const parentId = (node as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeName = (parent as any)?.properties?.distributionName;
        if (typeof maybeName === 'string' && maybeName.trim()) distributionName = maybeName.trim();
      }
      if (!distributionName) distributionName = (node.icon.name || 'my_cdn_distribution').toString();
      let originDomain = (node as any)?.properties?.originDomain;
      if (typeof originDomain !== 'string' || !originDomain.trim()) originDomain = 'my_app_storage_bucket.s3.amazonaws.com';
      const resolveBucketNameFromDomain = (domain: string): string => {
        const match = domain.match(/^([a-z0-9\-_.]+)\.s3\.amazonaws\.com$/i);
        return match ? match[1] : domain.replace(/[^a-z0-9\-]/gi, '-');
      };
      const findConnectedS3BucketName = (cfNodeId: string): string | null => {
        for (const conn of state.connections) {
          let otherNodeId: string | null = null;
          if (conn.fromNodeId === cfNodeId) otherNodeId = conn.toNodeId;
          else if (conn.toNodeId === cfNodeId) otherNodeId = conn.fromNodeId;
          if (!otherNodeId) continue;
          const other = state.placedNodes.find((n) => n.id === otherNodeId);
          if (!other) continue;
          const isS3Bucket = other.subServiceId === 's3-bucket' || other.icon.id === 's3-bucket';
          if (isS3Bucket) {
            let bName = '';
            const s3ParentId = (other as any)?.parentNodeId;
            if (s3ParentId) {
              const s3Parent = state.placedNodes.find((n) => n.id === s3ParentId);
              const maybeBucket = (s3Parent as any)?.properties?.bucketName;
              if (typeof maybeBucket === 'string' && maybeBucket.trim()) bName = maybeBucket.trim();
            }
            if (!bName) {
              const own = (other as any)?.properties?.bucketName;
              if (typeof own === 'string' && own.trim()) bName = own.trim();
            }
            if (!bName) bName = other.icon.name || 'my_app_storage_bucket';
            return bName;
          }
        }
        return null;
      };
      const connectedBucketName = findConnectedS3BucketName(node.id);
      const bucketNameForIds = connectedBucketName || resolveBucketNameFromDomain(originDomain);
      const originId = `S3-${bucketNameForIds.replace(/_/g, '-')}`;
      const nameTag = distributionName;
      const sanitizedName = sanitize(nameTag);
      const properties = {
        origin: { domain_name: originDomain, origin_id: originId },
        enabled: true,
        is_ipv6_enabled: true,
        default_cache_behavior: {
          target_origin_id: originId,
          viewer_protocol_policy: 'redirect-to-https',
          allowed_methods: ['GET', 'HEAD', 'OPTIONS'],
          cached_methods: ['GET', 'HEAD'],
        },
        restrictions: { geo_restriction: { restriction_type: 'none' } },
        viewer_certificate: { cloudfront_default_certificate: true },
      } as Record<string, any>;
      return { nodeId: node.id, parentId, nameTag, sanitizedName, properties };
    });
    const cfGroups = groupItems(cfItems);
    const cloudfrontResources = cfGroups.map((group) => {
      const mergedProps = group.reduce((acc, it) => mergeProps(acc, it.properties), {} as Record<string, any>);
      const nameTag = group[0]?.nameTag || 'cloudfront_distribution';
      return { type: 'aws_cloudfront_distribution', name: sanitize(nameTag), properties: stripNullsDeep(mergedProps) };
    });

    return [
      ...ec2Resources,
      ...securityGroupResources,
      ...eipResources,
      ...s3BucketResources,
      ...vpcResources,
      ...cloudfrontResources,
    ];
  };

  const generateDrawioXML = () => {
    const { placedNodes, connections } = state;

    // Draw.io XML structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="AWS-Builder" version="24.7.17">
  <diagram name="AWS Architecture" id="aws-arch">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />`;

    // Add nodes
    placedNodes.forEach((node, index) => {
      const cellId = `node-${index + 2}`;
      const svgData = node.icon.svg || '';
      xml += `
        <mxCell id="${cellId}" value="${node.icon.name}" style="shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;imageAspect=0;aspect=fixed;image=data:image/svg+xml,${encodeURIComponent(svgData)}" vertex="1" parent="1">
          <mxGeometry x="${node.x}" y="${node.y}" width="${node.icon.width}" height="${node.icon.height}" as="geometry" />
        </mxCell>`;
    });

    // Add connections
    connections.forEach((connection, index) => {
      const fromIndex = placedNodes.findIndex(n => n.id === connection.fromNodeId);
      const toIndex = placedNodes.findIndex(n => n.id === connection.toNodeId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const connectionId = `connection-${index + placedNodes.length + 2}`;
        const fromCellId = `node-${fromIndex + 2}`;
        const toCellId = `node-${toIndex + 2}`;

        xml += `
        <mxCell id="${connectionId}" value="" style="endArrow=classic;html=1;rounded=0;strokeColor=${connection.color || '#3B82F6'};strokeWidth=2;" edge="1" parent="1" source="${fromCellId}" target="${toCellId}">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="400" y="300" as="sourcePoint" />
            <mxPoint x="450" y="250" as="targetPoint" />
          </mxGeometry>
        </mxCell>`;
      }
    });

    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
  };

  const handleExportToDrawio = async () => {
    if (state.placedNodes.length === 0) {
      alert('Please add some AWS services to the canvas before exporting');
      return;
    }

    setIsExporting(true);

    try {
      const xmlContent = generateDrawioXML();

      // Create and download file
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-architecture-${Date.now()}.drawio`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenInDrawio = () => {
    if (state.placedNodes.length === 0) {
      alert('Please add some AWS services to the canvas before opening in Draw.io');
      return;
    }

    const xmlContent = generateDrawioXML();
    const encodedXml = encodeURIComponent(xmlContent);
    const drawioUrl = `https://app.diagrams.net/?xml=${encodedXml}`;

    window.open(drawioUrl, '_blank');
  };

  const handleExportJSON = async () => {
    const resources = buildRequestedJSONFormat();

    if (!resources || resources.length === 0) {
      alert('Please add EC2, S3 Bucket, Lambda, RDS, VPC, or CloudFront before exporting JSON');
      return;
    }

    // Compile all resources into a single JSON file
    const resourcesWithHcl = resources.map((r: any) => ({
      ...r,
      hcl: formatAlignedHclBlock(r.type, sanitizeResourceName(r.name), r.properties),
    }));
    const compiled = { resources: resourcesWithHcl };

    const blob = new Blob([JSON.stringify(compiled, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aws-architecture-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Terraform (HCL) Export ---
  const sanitizeResourceName = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

  const getAwsRegionFromNodes = (): any => {
    // Determine a single AWS region string from nodes' properties.
    // Strategy:
    // - Collect region from each node's properties and its parent (if present)
    // - Choose the most frequent region value
    // - Fallback to 'us-east-1' when none is set
    const counts: Record<string, number> = {};
    const addRegion = (val: any) => {
      if (typeof val === 'string') {
        const r = val.trim();
        if (r) counts[r] = (counts[r] || 0) + 1;
      }
    };
    for (const n of state.placedNodes) {
      addRegion((n as any)?.properties?.region);
      const pid = (n as any)?.parentNodeId;
      if (pid) {
        const parent = state.placedNodes.find((m) => m.id === pid);
        addRegion((parent as any)?.properties?.region);
      }
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return 'us-east-1';
    return entries[0][0];
  };

  // --- Helpers for HCL formatting ---
  const toSnakeCase = (key: string) => key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();

  const formatHclValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const parts = value.map(v => typeof v === 'string' ? `"${v}"` : formatHclValue(v));
      return `[\n    ${parts.join(',\n    ')}\n  ]`;
    }
    if (typeof value === 'object') {
      // Terraform reference wrapper: { __ref: "aws_x.y.id" }
      const refVal = (value as any)?.__ref;
      if (typeof refVal === 'string' && refVal.trim()) {
        return refVal.trim();
      }
      const entries = Object.entries(value)
        .filter(([k, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${toSnakeCase(k)} = ${formatHclValue(v)}`);
      if (entries.length === 0) return '{}';
      return `{\n    ${entries.join('\n    ')}\n  }`;
    }
    // Escape quotes in strings and handle empty strings
    const stringValue = String(value);
    if (stringValue === '') return '""';
    return `"${stringValue.replace(/"/g, '\\"')}"`;
  };

  const formatAlignedHclBlock = (
    resourceType: string,
    resourceName: string,
    properties: Record<string, any>
  ): string => {
    // Terraform nested block keys per resource type
    const BLOCK_KEYS: Record<string, string[]> = {
      aws_instance: ['root_block_device', 'ebs_block_device', 'network_interface'],
      aws_s3_bucket: ['versioning', 'cors_rule', 'lifecycle_rule', 'lifecycle'],
      aws_cloudfront_distribution: ['origin', 'default_cache_behavior', 'restrictions', 'viewer_certificate'],
      aws_security_group: ['ingress', 'egress']
    };

    const isBlockKey = (key: string) => {
      const snake = toSnakeCase(key);
      const blocks = BLOCK_KEYS[resourceType] || [];
      return blocks.includes(snake);
    };

    // EC2-specific mapping to Terraform schema
    let normalized: Record<string, any> = { ...properties };
    if (resourceType === 'aws_instance') {
      // keyPair -> key_name
      if (normalized.keyPair) {
        normalized.key_name = normalized.keyPair;
        delete normalized.keyPair;
      }
      // securityGroups -> vpc_security_group_ids
      if (normalized.securityGroups) {
        normalized.vpc_security_group_ids = normalized.securityGroups;
        delete normalized.securityGroups;
      }
      // name -> tags.Name
      if (normalized.name) {
        const currentTags = normalized.tags && typeof normalized.tags === 'object' ? normalized.tags : {};
        normalized.tags = { ...currentTags, Name: normalized.name };
        delete normalized.name;
      }
      // volume props -> root_block_device block
      const rbd: Record<string, any> = {};
      if (normalized.volumeType) {
        rbd.volume_type = normalized.volumeType;
        delete normalized.volumeType;
      }
      if (normalized.size) {
        const parsed = typeof normalized.size === 'string' ? parseInt(normalized.size, 10) : normalized.size;
        rbd.volume_size = isNaN(parsed) ? normalized.size : parsed;
        delete normalized.size;
      }
      if (normalized.encrypted !== undefined) {
        rbd.encrypted = normalized.encrypted;
        delete normalized.encrypted;
      }
      if (Object.keys(rbd).length) {
        normalized.root_block_device = rbd;
      }
      // Clean up tags: drop empty values
      if (normalized.tags && typeof normalized.tags === 'object') {
        const t: Record<string, any> = {};
        Object.entries(normalized.tags).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') t[k] = v;
        });
        normalized.tags = t;
      }

      // Non-instance attributes that don't belong here
      delete (normalized as any).groupName;
      delete (normalized as any).inboundRules;
    }

    // Filter out Canvas-specific and non-Terraform properties
    const terraformProperties = Object.entries(normalized)
      .filter(([key, value]) => {
        if (['id', 'type', 'position', 'data', 'parentNodeId', 'width', 'height', 'region', 'domain'].includes(key)) {
          return false;
        }
        if (value === null || value === undefined || value === '') {
          return false;
        }
        return true;
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);

    if (Object.keys(terraformProperties).length === 0) {
      return `resource "${resourceType}" "${resourceName}" {\n  # No properties configured\n}`;
    }

    // Attributes (non-blocks) alignment
    const attrEntries = Object.entries(terraformProperties)
      .filter(([k]) => !isBlockKey(k))
      .map(([k, v]) => [k, v] as [string, any]);
    const maxKeyLen = attrEntries.reduce((m, [k]) => Math.max(m, toSnakeCase(k).length), 0);
    const formatTags = (obj: Record<string, any>) => {
      const entries = Object.entries(obj)
        .filter(([tk, tv]) => tv !== null && tv !== undefined)
        .map(([tk, tv]) => `${tk} = ${typeof tv === 'string' ? `"${tv}"` : formatHclValue(tv)}`);
      return `{ ${entries.join(', ')} }`;
    };
    const attrLines = attrEntries.map(([k, v]) => {
      const keyHcl = toSnakeCase(k);
      if (keyHcl === 'tags' && v && typeof v === 'object') {
        return `  ${keyHcl.padEnd(maxKeyLen, ' ')} = ${formatTags(v)}`;
      }
      const formatted = formatHclValue(v);
      // Ensure multi-line array/object values are properly aligned under the key
      if (formatted.startsWith('[\n') || formatted.startsWith('{\n')) {
        return `  ${keyHcl.padEnd(maxKeyLen, ' ')} = ${formatted}`;
      }
      return `  ${keyHcl.padEnd(maxKeyLen, ' ')} = ${formatted}`;
    });

    // Block rendering
    const renderBlockBody = (obj: Record<string, any>): string => {
      const entries = Object.entries(obj)
        .filter(([bk, bv]) => bv !== null && bv !== undefined && bv !== '')
        .map(([bk, bv]) => `    ${toSnakeCase(bk)} = ${formatHclValue(bv)}`);
      return entries.join('\n');
    };

    const blockLines: string[] = [];
    for (const [key, value] of Object.entries(terraformProperties)) {
      if (!isBlockKey(key)) continue;
      const snake = toSnakeCase(key);
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') {
            blockLines.push(`  ${snake} {\n${renderBlockBody(item)}\n  }`);
          }
        }
      } else if (value && typeof value === 'object') {
        blockLines.push(`  ${snake} {\n${renderBlockBody(value)}\n  }`);
      } else {
        // Fallback to attribute if not an object
        blockLines.push(`  ${snake} = ${formatHclValue(value)}`);
      }
    }

    const lines = [...attrLines, ...blockLines];
    return `resource "${resourceType}" "${resourceName}" {\n${lines.join('\n')}\n}`;
  };

  const generateTerraformHCL = (): string => {
    const providerBlock = `provider "aws" {\n  region = "${getAwsRegionFromNodes()}"\n}`;

    // Build grouped resources using the same logic as JSON export
    const groupedResources = buildRequestedJSONFormat();
    console.log('Terraform Export - Grouped Resources:', groupedResources);
    if (!groupedResources || groupedResources.length === 0) {
      console.log('No resources found for Terraform export');
      return providerBlock;
    }
    const resourcesHcl: string[] = [];
    groupedResources.forEach((res: any) => {
      const resourceType: string = res.type || 'aws_resource';
      const resourceName: string = sanitizeResourceName(res.name || 'resource');
      const properties: Record<string, any> = res.properties || {};
      console.log(`Generating HCL for ${resourceType}.${resourceName}:`, properties);
      resourcesHcl.push(formatAlignedHclBlock(resourceType, resourceName, properties));
    });

    const finalHcl = [providerBlock, ...resourcesHcl].join('\n\n');
    console.log('Final Terraform HCL:', finalHcl);
    return finalHcl;
  };

  const handleExportTerraform = () => {
    // For now, support AWS EC2 Instance export
    const hcl = generateTerraformHCL();

    if (!hcl || !hcl.includes('resource')) {
      alert('No supported resources found to export. Add EC2 or RDS.');
      return;
    }

    const blob = new Blob([hcl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.tf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Export</h3>
        <div className="text-xs text-gray-500">
          {state.placedNodes.length} services
        </div>
      </div>

      <div className="space-y-2">
        {/* Export to Draw.io File */}
        <button
          onClick={handleExportToDrawio}
          disabled={isExporting || state.placedNodes.length === 0}
          className="w-full group flex items-center gap-3 px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">📁</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Download .drawio</div>
            <div className="text-xs text-gray-500">Save as Draw.io file</div>
          </div>
        </button>

        {/* Open in Draw.io */}
        <button
          onClick={handleOpenInDrawio}
          disabled={state.placedNodes.length === 0}
          className="w-full group flex items-center gap-3 px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:border-green-300 hover:bg-green-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🌐</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Open in Draw.io</div>
            <div className="text-xs text-gray-500">Open directly in browser</div>
          </div>
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500/30 transition-all"
          onClick={() => {
            const nodes = state.placedNodes
              .filter((group: any) => group.parentNodeId !== "root" && group.parentNodeId !== null && group.parentNodeId !== undefined);

            const n = nodes.length;
            const parentArr: number[] = Array.from({ length: n }, (_, i) => i);
            const find = (x: number): number => {
              while (parentArr[x] !== x) { parentArr[x] = parentArr[parentArr[x]]; x = parentArr[x]; }
              return x;
            };
            const union = (a: number, b: number) => {
              const ra = find(a), rb = find(b);
              if (ra !== rb) parentArr[rb] = ra;
            };

            // Union by name
            const nameMap: Record<string, number[]> = {};
            nodes.forEach((node: any, idx: number) => {
              const key = node?.icon?.name || node?.label || "instance name";
              if (!nameMap[key]) nameMap[key] = [];
              nameMap[key].push(idx);
            });
            Object.values(nameMap).forEach((arr) => { for (let i = 1; i < arr.length; i++) union(arr[0], arr[i]); });

            // Union by parentNodeId
            const pMap: Record<string, number[]> = {};
            nodes.forEach((node: any, idx: number) => {
              const p = (node as any)?.parentNodeId;
              if (!p) return;
              const key = String(p);
              if (!pMap[key]) pMap[key] = [];
              pMap[key].push(idx);
            });
            Object.values(pMap).forEach((arr) => { for (let i = 1; i < arr.length; i++) union(arr[0], arr[i]); });

            // Build groups
            const groupsMap: Record<number, number[]> = {};
            for (let i = 0; i < n; i++) {
              const r = find(i);
              if (!groupsMap[r]) groupsMap[r] = [];
              groupsMap[r].push(i);
            }
            const groups = Object.values(groupsMap).map((idxs) => idxs.map((i) => nodes[i]));

            const mergeProps = (groupNodes: any[]) => {
              const allKeys = Array.from(new Set(groupNodes.flatMap((n: any) => Object.keys(n?.properties || {}))));
              const result: Record<string, any> = {};
              allKeys.forEach((k) => {
                const vals = groupNodes.map((n: any) => (n?.properties || {})[k]).filter((v) => v !== undefined && v !== null);
                if (vals.length === 0) return;
                const first = vals[0];
                const allEqual = vals.every((v) => {
                  try { return JSON.stringify(v) === JSON.stringify(first); } catch { return v === first; }
                });
                if (allEqual) {
                  result[k] = first;
                } else if (vals.every((v) => Array.isArray(v))) {
                  const unionVals = Array.from(new Set((vals as any[]).flat()));
                  result[k] = unionVals;
                } else if (vals.every((v) => typeof v !== 'object' || v === null)) {
                  const uniq = Array.from(new Set(vals));
                  result[k] = uniq.length === 1 ? uniq[0] : uniq;
                } else {
                  result[k] = vals[vals.length - 1];
                }
              });
              return result;
            };

            const exportGroups = groups.map((groupNodes) => {
              const names = groupNodes.map((n: any) => n?.icon?.name || n?.label).filter(Boolean) as string[];
              const nameFreq: Record<string, number> = {};
              names.forEach((nm) => { nameFreq[nm] = (nameFreq[nm] || 0) + 1; });
              const name = names.length
                ? Object.entries(nameFreq).sort((a, b) => b[1] - a[1])[0][0]
                : 'instance name';
              const distinctServiceIds = Array.from(new Set(groupNodes.map((n: any) => n?.subServiceId || n?.icon?.id || 'instance')));
              const merged = mergeProps(groupNodes);
              return { name, services: distinctServiceIds, properties: merged };
            });

            const sanitize = (name: string) => sanitizeResourceName(name || 'instance');
            const parsePorts = (rules: any): number[] => {
              if (typeof rules !== 'string') return [];
              return rules
                .split(',')
                .map((s) => s.trim())
                .map((s) => {
                  const m = s.match(/(\d{1,5})/);
                  return m ? parseInt(m[1], 10) : NaN;
                })
                .filter((p) => !isNaN(p));
            };

            const hclParts: string[] = [];
            exportGroups.forEach((group) => {
              // Only build EC2-style stack if EC2 present
              const hasEc2 = group.services.some((s: any) => s === 'ec2-instance');
              if (!hasEc2) return;

              const baseName = sanitize(group.name);
              const ami = typeof group.properties.ami === 'string' ? group.properties.ami : 'ami-0abcdef1234567890';
              const instanceType = typeof group.properties.instanceType === 'string' ? group.properties.instanceType : 't2.micro';
              const volumeSize = typeof group.properties.size === 'number' ? group.properties.size : 20;
              const volumeType = typeof group.properties.volumeType === 'string' ? group.properties.volumeType : 'gp3';
              const encrypted = typeof group.properties.encrypted === 'boolean' ? group.properties.encrypted : false;
              const sgName = typeof group.properties.groupName === 'string' && group.properties.groupName.trim()
                ? group.properties.groupName.trim()
                : 'default-sg';

              const ports = parsePorts(group.properties.inboundRules);
              const ingressPorts = ports.length ? ports : [22, 80, 443];

              // Security Group
              hclParts.push(`resource "aws_security_group" "ec2_instance_${baseName}_sg" {
  name        = "${sgName}"
  description = "Allow SSH, HTTP, and HTTPS"
  vpc_id      = "your-vpc-id"
${ingressPorts.map((p: number) => `  ingress {
    description = "${p === 22 ? 'SSH' : p === 80 ? 'HTTP' : p === 443 ? 'HTTPS' : 'Port ' + p}"
    from_port   = ${p}
    to_port     = ${p}
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }`).join('\n')}
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${sgName}"
  }
}`);

              // EC2 Instance
              hclParts.push(`resource "aws_instance" "ec2_instance_${baseName}" {
  ami                    = "${ami}"
  instance_type          = "${instanceType}"
  vpc_security_group_ids = [aws_security_group.ec2_instance_${baseName}_sg.id]
  tags = {
    Name = "${group.name}"
  }
}`);

              // EBS Volume
              hclParts.push(`resource "aws_ebs_volume" "ec2_instance_${baseName}_volume" {
  availability_zone = aws_instance.ec2_instance_${baseName}.availability_zone
  size              = ${volumeSize}
  type              = "${volumeType}"
  encrypted         = ${encrypted ? 'true' : 'false'}
  tags = {
    Name = "${baseName}-volume"
  }
}`);

              // Attach EBS volume
              hclParts.push(`resource "aws_volume_attachment" "ec2_instance_${baseName}_attachment" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.ec2_instance_${baseName}_volume.id
  instance_id = aws_instance.ec2_instance_${baseName}.id
}`);

              // Elastic IP
              hclParts.push(`resource "aws_eip" "ec2_instance_${baseName}_eip" {
  instance = aws_instance.ec2_instance_${baseName}.id
  domain   = "vpc"
  tags = {
    Name = "${baseName}-eip"
  }
}`);
            });

            const terraformCode = hclParts.join('\n\n');
            if (!terraformCode.trim()) {
              alert('No EC2 groups found to export in tf-example style.');
              return;
            }

            const blob = new Blob([terraformCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tf-example-style.tf';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500/30 transition-all"
          onClick={() => {
            const nodes = state.placedNodes
              .filter((group: any) => group.parentNodeId !== "root" && group.parentNodeId !== null && group.parentNodeId !== undefined);

            const n = nodes.length;
            const parentArr: number[] = Array.from({ length: n }, (_, i) => i);
            const find = (x: number): number => {
              while (parentArr[x] !== x) { parentArr[x] = parentArr[parentArr[x]]; x = parentArr[x]; }
              return x;
            };
            const union = (a: number, b: number) => {
              const ra = find(a), rb = find(b);
              if (ra !== rb) parentArr[rb] = ra;
            };

            // Union by name
            const nameMap: Record<string, number[]> = {};
            nodes.forEach((node: any, idx: number) => {
              const key = node?.icon?.name || node?.label || "instance name";
              if (!nameMap[key]) nameMap[key] = [];
              nameMap[key].push(idx);
            });
            Object.values(nameMap).forEach((arr) => { for (let i = 1; i < arr.length; i++) union(arr[0], arr[i]); });

            // Union by parentNodeId
            const pMap: Record<string, number[]> = {};
            nodes.forEach((node: any, idx: number) => {
              const p = (node as any)?.parentNodeId;
              if (!p) return;
              const key = String(p);
              if (!pMap[key]) pMap[key] = [];
              pMap[key].push(idx);
            });
            Object.values(pMap).forEach((arr) => { for (let i = 1; i < arr.length; i++) union(arr[0], arr[i]); });

            // Build groups
            const groupsMap: Record<number, number[]> = {};
            for (let i = 0; i < n; i++) {
              const r = find(i);
              if (!groupsMap[r]) groupsMap[r] = [];
              groupsMap[r].push(i);
            }
            const groups = Object.values(groupsMap).map((idxs) => idxs.map((i) => nodes[i]));

            const mergeProps = (groupNodes: any[]) => {
              const allKeys = Array.from(new Set(groupNodes.flatMap((n: any) => Object.keys(n?.properties || {}))));
              const result: Record<string, any> = {};
              allKeys.forEach((k) => {
                const vals = groupNodes.map((n: any) => (n?.properties || {})[k]).filter((v) => v !== undefined && v !== null);
                if (vals.length === 0) return;
                const first = vals[0];
                const allEqual = vals.every((v) => {
                  try { return JSON.stringify(v) === JSON.stringify(first); } catch { return v === first; }
                });
                if (allEqual) {
                  result[k] = first;
                } else if (vals.every((v) => Array.isArray(v))) {
                  const unionVals = Array.from(new Set((vals as any[]).flat()));
                  result[k] = unionVals;
                } else if (vals.every((v) => typeof v !== 'object' || v === null)) {
                  const uniq = Array.from(new Set(vals));
                  result[k] = uniq.length === 1 ? uniq[0] : uniq;
                } else {
                  result[k] = vals[vals.length - 1];
                }
              });
              return result;
            };

            const exportGroups = groups.map((groupNodes) => {
              const names = groupNodes.map((n: any) => n?.icon?.name || n?.label).filter(Boolean) as string[];
              const nameFreq: Record<string, number> = {};
              names.forEach((nm) => { nameFreq[nm] = (nameFreq[nm] || 0) + 1; });
              const name = names.length
                ? Object.entries(nameFreq).sort((a, b) => b[1] - a[1])[0][0]
                : 'instance name';
              const distinctServiceIds = Array.from(new Set(groupNodes.map((n: any) => n?.serviceId || 'instance')));
              const merged = mergeProps(groupNodes);
              return { name, services: distinctServiceIds, properties: merged };
            });

            const terraformCode = exportGroups.map((group) => {
              const { name, properties } = group;
              const formatVal = (v: any): string => {
                if (Array.isArray(v)) {
                  const parts = v.map((x) => formatVal(x));
                  return `[${parts.join(', ')}]`;
                }
                if (v && typeof v === 'object') {
                  return JSON.stringify(v);
                }
                if (typeof v === 'boolean' || typeof v === 'number') return String(v);
                return `"${String(v)}"`;
              };
              const lines = Object.entries(properties)
                .map(([k, v]) => `  ${k} = ${formatVal(v)}`)
                .join('\n');
              return `resource "aws_instance" "${name}" {\n${lines}\n}`;
            }).join('\n\n');

            const blob = new Blob([terraformCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'terraform.tf';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export To Terraform
        </button>


      </div>

    </div>
  );
}