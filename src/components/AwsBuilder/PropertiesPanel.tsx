import React, { useState, useEffect, useMemo } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { useSecurityGroups } from '@/context/SecurityGroupsContext';
import { useCloudProvider } from '@/context/CloudProviderContext';
import { getProviderTheme } from '@/data/theme-colors';
import { ServiceProperty, SubService, DetailedAwsService } from '../../data/aws-services-detailed';
import SecurityGroupDropdown from '@/components/SecurityGroups/SecurityGroupDropdown';
import SecurityGroupModal from '@/components/SecurityGroups/SecurityGroupModal';

// Summary: Properties Panel component - shows configuration options for selected service/sub-service
// - Displays properties form and allows saving configuration

const PropertiesPanel: React.FC = () => {
  const { currentProvider } = useCloudProvider();
  const { state, closePropertiesPanel, updateNodeProperties, openServiceModal, closeServiceModal, addSubServiceNode, openPropertiesPanel, listSecurityGroupsForParent, updateEc2SecurityGroups } = useAwsBuilder();
  const [propertyValues, setPropertyValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listeners, setListeners] = useState<{ protocol: string; port: number; target: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'ai' | 'subservices'>('properties');
  const [panelExpanded, setPanelExpanded] = useState<boolean>(true);
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<string[]>([]);
  const { groups: allSecurityGroups, updateGroup } = useSecurityGroups();
  const [sgModalOpen, setSgModalOpen] = useState(false);
  const [sgEditTargetId, setSgEditTargetId] = useState<string | null>(null);

  const service = state.selectedService;
  const subService = state.selectedSubService;
  const editingNode = state.selectedNodeId
    ? state.placedNodes.find(n => n.id === state.selectedNodeId)
    : null;
  console.log(editingNode, "editingNode")
  const theme = getProviderTheme(currentProvider);
  const subServicesList = useMemo(() => {
    const svc = service as any;
    return Array.isArray(svc?.subServices) ? svc.subServices : [];
  }, [service]);

  useEffect(() => {
    if (!editingNode) {
      setSelectedSecurityGroups([]);
      return;
    }
    const isEc2Instance = editingNode.subServiceId === 'ec2-instance' ||
      (editingNode as any)?.icon?.id === 'ec2-instance';
    if (isEc2Instance) {
      const sgNames: string[] = Array.isArray((editingNode as any)?.properties?.securityGroups)
        ? (editingNode as any).properties.securityGroups
        : [];
      setSelectedSecurityGroups(sgNames);
    } else {
      setSelectedSecurityGroups([]);
    }
  }, [editingNode?.id]);

  // JSON script preview (mirror export mappings)
  const sanitize = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

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

  const scriptObject = useMemo(() => {
    // If no specific node is selected, show all canvas objects (like export format)
    if (!editingNode) {
      if (state.placedNodes.length === 0) {
        return { message: "Canvas is empty. Add some AWS services to see their configuration." };
      }

      // Build complete canvas state using same logic as ExportPanel
      const allResources: any[] = [];

      // EC2 Instances
      const ec2Resources = state.placedNodes
        .filter((node) => node.subServiceId === 'ec2-instance' || node.icon.id === 'ec2-instance')
        .map((node) => {
          const ami = (node as any)?.properties?.ami || '';
          const instanceType = (node as any)?.properties?.instanceType || '';
          const keyName = (node as any)?.properties?.keyPair || '';
          const securityGroups: string[] = Array.isArray((node as any)?.properties?.securityGroups)
            ? (node as any).properties.securityGroups
            : [];

          let parentName: string | undefined = undefined;
          if ((node as any)?.parentNodeId) {
            const parent = state.placedNodes.find((n) => n.id === (node as any).parentNodeId);
            const maybeName = (parent as any)?.properties?.name;
            if (typeof maybeName === 'string' && maybeName.trim()) {
              parentName = maybeName.trim();
            }
          }
          const nameTag = parentName || node.icon.name || 'web_server';
          const resourceName = sanitize(nameTag);

          return {
            type: 'aws_instance',
            name: resourceName,
            properties: {
              ami,
              instance_type: instanceType,
              subnet_id: resolveSubnetIdForInstance(node.id),
              key_name: keyName,
              security_groups: securityGroups,
              tags: { Name: nameTag, Environment: 'Production' },
            },
          };
        });

      // S3 Buckets
      const s3Resources = state.placedNodes
        .filter((node) => node.subServiceId === 's3-bucket' || node.icon.id === 's3-bucket')
        .map((node) => {
          let bucketName: string = '';
          const parentId = (node as any)?.parentNodeId;
          if (parentId) {
            const parent = state.placedNodes.find((n) => n.id === parentId);
            const maybeBucket = (parent as any)?.properties?.bucketName;
            if (typeof maybeBucket === 'string' && maybeBucket.trim()) bucketName = maybeBucket.trim();
          }
          if (!bucketName) {
            const own = (node as any)?.properties?.bucketName;
            if (typeof own === 'string' && own.trim()) bucketName = own.trim();
          }
          if (!bucketName) bucketName = 'my-s3-bucket';

          const storageClass = (node as any)?.properties?.storageClass || 'STANDARD';
          const versioning = Boolean((node as any)?.properties?.versioning);
          const blockPublicAccess = (node as any)?.properties?.publicAccess;
          const blockPublic = typeof blockPublicAccess === 'boolean' ? blockPublicAccess : true;

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
              if (transition_days !== undefined || expiration_days !== undefined) {
                lifecycle = { transition_days, expiration_days };
              }
            }
          }

          const resourceName = sanitize(bucketName);
          return {
            type: 'aws_s3_bucket',
            name: resourceName,
            properties: {
              bucket: bucketName,
              acl: blockPublic ? 'private' : 'public-read',
              storage_class: storageClass,
              versioning: { enabled: versioning },
              block_public_access: blockPublic,
              tags: { Name: bucketName, Environment: 'Production' },
              ...(lifecycle ? { lifecycle } : {}),
            },
          };
        });

      // Lambda Functions
      const lambdaResources = state.placedNodes
        .filter((node) => node.subServiceId === 'lambda-function' || node.icon.id === 'lambda-function')
        .map((node) => {
          let functionName: string = '';
          let runtime: string = '';
          if ((node as any)?.parentNodeId) {
            const parent = state.placedNodes.find((n) => n.id === (node as any).parentNodeId);
            const maybeFn = (parent as any)?.properties?.functionName;
            const maybeRt = (parent as any)?.properties?.runtime;
            if (typeof maybeFn === 'string' && maybeFn.trim()) functionName = maybeFn.trim();
            if (typeof maybeRt === 'string' && maybeRt.trim()) runtime = maybeRt.trim();
          }
          if (!functionName) functionName = node.icon.name || 'MyLambdaFunction';
          if (!runtime) runtime = 'nodejs18.x';

          const handler = (node as any)?.properties?.handler || 'index.handler';
          const roleProp = (node as any)?.properties?.role || ((node as any)?.parentNodeId
            ? (state.placedNodes.find((n) => n.id === (node as any).parentNodeId) as any)?.properties?.role
            : undefined);
          const role = typeof roleProp === 'string' && roleProp.trim()
            ? roleProp.trim()
            : 'arn:aws:iam::123456789012:role/lambda-execution-role';

          const nameTag = functionName;
          const resourceName = sanitize(nameTag);
          const sourceCodePath = `./lambda_code/${resourceName}/`;

          return {
            type: 'aws_lambda_function',
            name: resourceName,
            properties: {
              function_name: functionName,
              role,
              handler,
              runtime,
              source_code_path: sourceCodePath,
              tags: { Name: nameTag },
            },
          };
        });

      // RDS Instances
      const rdsResources = state.placedNodes
        .filter((node) => node.subServiceId === 'rds-instance' || node.icon.id === 'rds-instance')
        .map((node) => {
          let identifier: string = '';
          const parentId = (node as any)?.parentNodeId;
          if (parentId) {
            const parent = state.placedNodes.find((n) => n.id === parentId);
            const maybeId = (parent as any)?.properties?.dbInstanceIdentifier;
            if (typeof maybeId === 'string' && maybeId.trim()) identifier = maybeId.trim();
          }
          if (!identifier) identifier = node.icon.name || 'my-database';

          const engine = (node as any)?.properties?.engine || 'mysql';
          const instanceClass = (node as any)?.properties?.instanceClass || 'db.t3.micro';
          const alloc = (node as any)?.properties?.allocatedStorage;
          const allocated_storage = typeof alloc === 'number' ? alloc : 20;
          const engineVersion = (node as any)?.properties?.engineVersion;
          const publiclyAccessibleProp = (node as any)?.properties?.publiclyAccessible;
          const dbSubnetGroupNameProp = (node as any)?.properties?.dbSubnetGroupName;

          const resourceName = sanitize(identifier);
          return {
            type: 'aws_db_instance',
            name: resourceName,
            properties: {
              identifier,
              engine,
              engine_version: typeof engineVersion === 'string' && engineVersion.trim() ? engineVersion.trim() : null,
              instance_class: instanceClass,
              allocated_storage,
              db_name: 'mydatabase',
              username: 'dbadmin',
              password: 'SECRET_PASSWORD_PLACEHOLDER',
              publicly_accessible: typeof publiclyAccessibleProp === 'boolean' ? publiclyAccessibleProp : null,
              db_subnet_group_name: typeof dbSubnetGroupNameProp === 'string' && dbSubnetGroupNameProp.trim() ? dbSubnetGroupNameProp.trim() : null,
              skip_final_snapshot: true,
              tags: { Name: identifier },
            },
          };
        });

      // VPC Resources
      const vpcResources = state.placedNodes
        .filter((node) => ((node as any)?.serviceId === 'vpc' && !(node as any)?.subServiceId) || node.icon?.id === 'vpc')
        .map((node) => {
          const vpcName = (node as any)?.properties?.vpcName || node.icon.name || 'MyVPC';
          const cidrBlock = (node as any)?.properties?.cidrBlock || '10.0.0.0/16';
          const resourceName = sanitize(vpcName);
          return {
            type: 'aws_vpc',
            name: resourceName,
            properties: {
              cidr_block: cidrBlock,
              enable_dns_hostnames: true,
              tags: { Name: vpcName },
            },
          };
        });

      // CloudFront Distributions
      const cloudfrontResources = state.placedNodes
        .filter((node) => node.subServiceId === 'cf-distribution' || node.icon.id === 'cf-distribution')
        .map((node) => {
          let distributionName: string = '';
          const parentId = (node as any)?.parentNodeId;
          if (parentId) {
            const parent = state.placedNodes.find((n) => n.id === parentId);
            const maybeName = (parent as any)?.properties?.distributionName;
            if (typeof maybeName === 'string' && maybeName.trim()) distributionName = maybeName.trim();
          }
          if (!distributionName) distributionName = node.icon.name || 'my_cdn_distribution';

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

          const resourceName = sanitize(distributionName);
          return {
            type: 'aws_cloudfront_distribution',
            name: resourceName,
            properties: {
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
            },
          };
        });

      allResources.push(
        ...ec2Resources,
        ...s3Resources,
        ...lambdaResources,
        ...rdsResources,
        ...vpcResources,
        ...cloudfrontResources
      );

      return {
        total_resources: allResources.length,
        resources: allResources
      };
    }

    // EC2 Instance
    const isEc2Instance = editingNode.subServiceId === 'ec2-instance' || (editingNode as any).icon?.id === 'ec2-instance';
    if (isEc2Instance) {
      const ami = (editingNode as any)?.properties?.ami || '';
      const instanceType = (editingNode as any)?.properties?.instanceType || '';
      const keyName = (editingNode as any)?.properties?.keyPair || '';
      const sgNames: string[] = Array.isArray((editingNode as any)?.properties?.securityGroups)
        ? (editingNode as any).properties.securityGroups
        : [];

      let parentName: string | undefined = undefined;
      if ((editingNode as any)?.parentNodeId) {
        const parent = state.placedNodes.find((n) => n.id === (editingNode as any).parentNodeId);
        const maybeName = (parent as any)?.properties?.name;
        if (typeof maybeName === 'string' && maybeName.trim()) {
          parentName = maybeName.trim();
        }
      }

      const nameTag = parentName || (editingNode as any)?.icon?.name || 'web_server';
      const resourceName = sanitize(nameTag);

      return {
        type: 'aws_instance',
        name: resourceName,
        properties: {
          ami,
          instance_type: instanceType,
          subnet_id: resolveSubnetIdForInstance((editingNode as any).id),
          key_name: keyName,
          security_groups: sgNames,
          tags: { Name: nameTag, Environment: 'Production' },
        },
      };
    }

    // S3 Bucket
    const isS3Bucket = editingNode.subServiceId === 's3-bucket' || (editingNode as any)?.icon?.id === 's3-bucket';
    if (isS3Bucket) {
      let bucketName: string = '';
      const parentId = (editingNode as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeBucket = (parent as any)?.properties?.bucketName;
        if (typeof maybeBucket === 'string' && maybeBucket.trim()) bucketName = maybeBucket.trim();
      }
      if (!bucketName) {
        const own = (editingNode as any)?.properties?.bucketName;
        if (typeof own === 'string' && own.trim()) bucketName = own.trim();
      }
      if (!bucketName) bucketName = 'my-s3-bucket';

      const storageClass = (editingNode as any)?.properties?.storageClass || 'STANDARD';
      const versioning = Boolean((editingNode as any)?.properties?.versioning);
      const blockPublicAccess = (editingNode as any)?.properties?.publicAccess;
      const blockPublic = typeof blockPublicAccess === 'boolean' ? blockPublicAccess : true;

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
          if (transition_days !== undefined || expiration_days !== undefined) {
            lifecycle = { transition_days, expiration_days };
          }
        }
      }

      const resourceName = sanitize(bucketName);
      return {
        type: 'aws_s3_bucket',
        name: resourceName,
        properties: {
          bucket: bucketName,
          acl: blockPublic ? 'private' : 'public-read',
          storage_class: storageClass,
          versioning: { enabled: versioning },
          block_public_access: blockPublic,
          tags: { Name: bucketName, Environment: 'Production' },
          ...(lifecycle ? { lifecycle } : {}),
        },
      };
    }

    // Lambda Function
    const isLambda = editingNode.subServiceId === 'lambda-function' || (editingNode as any)?.icon?.id === 'lambda-function';
    if (isLambda) {
      let functionName: string = '';
      let runtime: string = '';
      const parentId = (editingNode as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeFn = (parent as any)?.properties?.functionName;
        const maybeRt = (parent as any)?.properties?.runtime;
        if (typeof maybeFn === 'string' && maybeFn.trim()) functionName = maybeFn.trim();
        if (typeof maybeRt === 'string' && maybeRt.trim()) runtime = maybeRt.trim();
      }
      if (!functionName) functionName = (editingNode as any)?.icon?.name || 'MyLambdaFunction';
      if (!runtime) runtime = 'nodejs18.x';

      const handler = (editingNode as any)?.properties?.handler || 'index.handler';
      const roleProp = (editingNode as any)?.properties?.role || (parentId
        ? (state.placedNodes.find((n) => n.id === parentId) as any)?.properties?.role
        : undefined);
      const role = typeof roleProp === 'string' && roleProp.trim() ? roleProp.trim() : 'arn:aws:iam::123456789012:role/lambda-execution-role';

      const nameTag = functionName;
      const resourceName = sanitize(nameTag);
      const sourceCodePath = `./lambda_code/${resourceName}/`;
      return {
        type: 'aws_lambda_function',
        name: resourceName,
        properties: {
          function_name: functionName,
          role,
          handler,
          runtime,
          source_code_path: sourceCodePath,
          tags: { Name: nameTag },
        },
      };
    }

    // RDS Instance
    const isRds = editingNode.subServiceId === 'rds-instance' || (editingNode as any)?.icon?.id === 'rds-instance';
    if (isRds) {
      let identifier: string = '';
      const parentId = (editingNode as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeId = (parent as any)?.properties?.dbInstanceIdentifier;
        if (typeof maybeId === 'string' && maybeId.trim()) identifier = maybeId.trim();
      }
      if (!identifier) identifier = (editingNode as any)?.icon?.name || 'my-database';

      const engine = (editingNode as any)?.properties?.engine || 'mysql';
      const instanceClass = (editingNode as any)?.properties?.instanceClass || 'db.t3.micro';
      const alloc = (editingNode as any)?.properties?.allocatedStorage;
      const allocated_storage = typeof alloc === 'number' ? alloc : 20;
      const engineVersion = (editingNode as any)?.properties?.engineVersion;
      const publiclyAccessibleProp = (editingNode as any)?.properties?.publiclyAccessible;
      const dbSubnetGroupNameProp = (editingNode as any)?.properties?.dbSubnetGroupName;

      const resourceName = sanitize(identifier);
      return {
        type: 'aws_db_instance',
        name: resourceName,
        properties: {
          identifier,
          engine,
          engine_version: typeof engineVersion === 'string' && engineVersion.trim() ? engineVersion.trim() : null,
          instance_class: instanceClass,
          allocated_storage,
          db_name: 'mydatabase',
          username: 'dbadmin',
          password: 'SECRET_PASSWORD_PLACEHOLDER',
          publicly_accessible: typeof publiclyAccessibleProp === 'boolean' ? publiclyAccessibleProp : null,
          db_subnet_group_name: typeof dbSubnetGroupNameProp === 'string' && dbSubnetGroupNameProp.trim() ? dbSubnetGroupNameProp.trim() : null,
          skip_final_snapshot: true,
          tags: { Name: identifier },
        },
      };
    }

    // VPC
    const isVpc = (((editingNode as any)?.serviceId === 'vpc' && !(editingNode as any)?.subServiceId) || (editingNode as any)?.icon?.id === 'vpc');
    if (isVpc) {
      const vpcName = (editingNode as any)?.properties?.vpcName || (editingNode as any)?.icon?.name || 'MyVPC';
      const cidrBlock = (editingNode as any)?.properties?.cidrBlock || '10.0.0.0/16';
      const resourceName = sanitize(vpcName);
      return {
        type: 'aws_vpc',
        name: resourceName,
        properties: {
          cidr_block: cidrBlock,
          enable_dns_hostnames: true,
          tags: { Name: vpcName },
        },
      };
    }

    // CloudFront Distribution
    const isCloudFront = editingNode.subServiceId === 'cf-distribution' || (editingNode as any)?.icon?.id === 'cf-distribution';
    if (isCloudFront) {
      let distributionName: string = '';
      const parentId = (editingNode as any)?.parentNodeId;
      if (parentId) {
        const parent = state.placedNodes.find((n) => n.id === parentId);
        const maybeName = (parent as any)?.properties?.distributionName;
        if (typeof maybeName === 'string' && maybeName.trim()) distributionName = maybeName.trim();
      }
      if (!distributionName) distributionName = (editingNode as any)?.icon?.name || 'my_cdn_distribution';

      let originDomain = (editingNode as any)?.properties?.originDomain;
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
          const isS3 = other.subServiceId === 's3-bucket' || other.icon.id === 's3-bucket';
          if (isS3) {
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

      const connectedBucketName = findConnectedS3BucketName((editingNode as any).id);
      const bucketNameForIds = connectedBucketName || resolveBucketNameFromDomain(originDomain);
      const originId = `S3-${bucketNameForIds.replace(/_/g, '-')}`;

      const resourceName = sanitize(distributionName);
      return {
        type: 'aws_cloudfront_distribution',
        name: resourceName,
        properties: {
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
        },
      };
    }

    return null;
  }, [editingNode, state.connections, state.placedNodes]);

  // Ensure panel expands on selection so collapsed icon bar doesn't show
  useEffect(() => {
    if (service || subService) {
      setPanelExpanded(true);
    }
  }, [service, subService]);

  // Combine common properties and sub-service properties
  const allProperties = [
    ...(service?.commonProperties || []),
    ...(subService?.properties || [])
  ];

  // Determine primary name-like property id from service schema
  const primaryNameId = useMemo(() => {
    const commons = service?.commonProperties || [];
    const exact = commons.find((p: any) => p.id === 'name');
    if (exact) return 'name';
    const nameLike = commons.find((p: any) => {
      const idStr = typeof p.id === 'string' ? p.id : '';
      const nameStr = typeof p.name === 'string' ? p.name : '';
      return /name|identifier/i.test(idStr) || /name|identifier/i.test(nameStr);
    });
    return nameLike ? nameLike.id : null;
  }, [service]);

  useEffect(() => {
    // Initialize property values with either existing node values (edit mode) or defaults (create mode)
    const initialProps: Record<string, any> = {};
    allProperties.forEach(prop => {
      const existingVal = editingNode?.properties?.[prop.id];
      initialProps[prop.id] = existingVal !== undefined ? existingVal : (prop.defaultValue ?? '');
    });
    setPropertyValues(initialProps);
    setErrors({});
    // Seed listeners only for Load Balancer-like services for UI preview
    const name = (subService?.name || service?.name || '').toLowerCase();
    if (name.includes('load balancer') || name.includes('elb') || name.includes('alb')) {
      setListeners([{ protocol: 'HTTPS', port: 443, target: 'tg-web-servers' }]);
    } else {
      setListeners([]);
    }
  }, [service, subService, state.selectedNodeId]);

  const handlePropertyChange = (propertyId: string, value: any) => {
    setPropertyValues(prev => ({
      ...prev,
      [propertyId]: value
    }));

    // Clear error when user starts typing
    if (errors[propertyId]) {
      setErrors(prev => ({
        ...prev,
        [propertyId]: ''
      }));
    }

    // Live-update parent instance name so aggregated tiles reflect immediately
    try {
      const isPrimaryName = !!primaryNameId && propertyId === primaryNameId;

      if (isPrimaryName) {
        // Determine the host parent similar to save logic
        const hostParent =
          (editingNode && !editingNode.isSubService ? editingNode : null)
          || (editingNode && editingNode.isSubService && editingNode.parentNodeId
            ? (state.placedNodes.find(n => n.id === editingNode.parentNodeId && !n.isSubService) || null)
            : null)
          || (state.selectedNodeId
            ? (state.placedNodes.find(n => n.id === state.selectedNodeId && !n.isSubService) || null)
            : null);

        if (hostParent) {
          updateNodeProperties(hostParent.id, { [primaryNameId as string]: value });
        } else if (editingNode && !editingNode.isSubService) {
          // Fallback: update currently editing parent
          updateNodeProperties(editingNode.id, { [primaryNameId as string]: value });
        }
      }
    } catch { }
  };

  const validateProperties = (): boolean => {
    const newErrors: Record<string, string> = {};

    allProperties.forEach(prop => {
      if (prop.required && (!propertyValues[prop.id] || propertyValues[prop.id] === '')) {
        newErrors[prop.id] = `${prop.name} is required`;
      }

      if (prop.type === 'number' && propertyValues[prop.id] && isNaN(Number(propertyValues[prop.id]))) {
        newErrors[prop.id] = `${prop.name} must be a valid number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateProperties()) {
      // Decide between editing existing node vs creating a new sub-service
      const commonPropIds = (service?.commonProperties || []).map(p => p.id);
      const subPropIds = (subService?.properties || []).map(p => p.id);

      const parentNode = editingNode && !editingNode.isSubService ? editingNode : null;

      if (editingNode && !subService) {
        const toSave: Record<string, any> = {};
        commonPropIds.forEach(id => {
          toSave[id] = propertyValues[id];
        });
        updateNodeProperties(editingNode.id, toSave);
        closePropertiesPanel();
        // Auto-close service modal after saving parent service properties
        closeServiceModal();
        return;
      }

      // Create mode: adding a new sub-service under currently selected parent
      if (service && subService) {
        // Collect any changes to parent common properties (e.g., instance name)
        const parentCommonToSave: Record<string, any> = {};
        commonPropIds.forEach(id => {
          if (propertyValues[id] !== undefined) {
            parentCommonToSave[id] = propertyValues[id];
          }
        });

        // Resolve host parent when editing a sub-service or adding a new one
        const hostParent: typeof parentNode =
          parentNode
          || (editingNode && editingNode.isSubService && editingNode.parentNodeId
            ? (state.placedNodes.find(n => n.id === editingNode.parentNodeId && !n.isSubService) || null)
            : null)
          || (state.selectedNodeId
            ? (state.placedNodes.find(n => n.id === state.selectedNodeId && !n.isSubService) || null)
            : null);

        // If editing an existing sub-service node, update it
        if (editingNode && editingNode.isSubService) {
          const toSave: Record<string, any> = {};
          subPropIds.forEach(id => {
            toSave[id] = propertyValues[id];
          });
          // Apply parent common property updates if present
          if (hostParent && Object.keys(parentCommonToSave).length > 0) {
            updateNodeProperties(hostParent.id, parentCommonToSave);
          }
          updateNodeProperties(editingNode.id, toSave);
          closePropertiesPanel();
          // Auto-close service modal after any save operation
          closeServiceModal();
          return;
        }

        // Otherwise, we are adding/updating a sub-service under the selected parent

        // Check if the same sub-service already exists under this parent
        const existing = hostParent
          ? state.placedNodes.find(n => n.isSubService && n.parentNodeId === hostParent.id && n.serviceId === (service as any).id && n.subServiceId === (subService as any).id)
          : null;

        if (existing) {
          // Update existing sub-service with provided config
          const toSave: Record<string, any> = {};
          subPropIds.forEach(id => {
            toSave[id] = propertyValues[id];
          });
          // Apply parent common property updates if present
          if (hostParent && Object.keys(parentCommonToSave).length > 0) {
            updateNodeProperties(hostParent.id, parentCommonToSave);
          }
          updateNodeProperties(existing.id, toSave);
        } else {
          // Add new sub-service under the parent with provided config
          // Position sub-service relative to parent
          let x = Math.random() * 400 + 100;
          let y = Math.random() * 300 + 100;
          if (hostParent) {
            x = hostParent.x + Math.random() * 100 - 50;
            y = hostParent.y + 100 + Math.random() * 50;
            x = Math.max(50, Math.min(x, 750));
            y = Math.max(50, Math.min(y, 550));
          }
          // Apply parent common property updates if present before adding
          if (hostParent && Object.keys(parentCommonToSave).length > 0) {
            updateNodeProperties(hostParent.id, parentCommonToSave);
          }
          addSubServiceNode(subService, service, x, y, propertyValues, hostParent ? hostParent.id : undefined);
        }
      }

      closePropertiesPanel();
      // Auto-close service modal after any save operation
      closeServiceModal();
    }
  };

  const renderPropertyInput = (property: ServiceProperty) => {
    const value = propertyValues[property.id] ?? '';
    const hasError = !!errors[property.id];
    const isPrimaryName = !!primaryNameId && property.id === primaryNameId;
    // Allow renaming the parent instance even when configuring a sub-service
    const isReadOnlyInstanceName = false;

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isPrimaryName && !subService) {
                // Allow quick save on Enter when renaming parent instance
                handleSave();
              }
            }}
            autoFocus={isPrimaryName && !subService}
            readOnly={isReadOnlyInstanceName}
            disabled={isReadOnlyInstanceName}
            className={`w-full mt-1 bg-slate-100 border rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-slate-300'
              }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full mt-1 bg-slate-100 border rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-slate-300'
              }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full mt-1 bg-white border rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-slate-300'
              }`}
          >
            <option className="bg-white" value="">Select {property.name}</option>
            {property.options?.map((option) => (
              <option className="bg-white" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handlePropertyChange(property.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600">
              {Boolean(value) ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            rows={3}
            className={`w-full mt-1 bg-slate-100 border rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${hasError ? 'border-red-500' : 'border-slate-300'
              }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full mt-1 bg-slate-100 border rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-slate-300'
              }`}
          />
        );
    }
  };
  let securityTabs
  securityTabs = editingNode?.properties?.securityGroups || selectedSecurityGroups
  return (
    <div
      className={`fixed top-0 right-0 h-[calc(100vh-104px)] mt-[104px] ${panelExpanded ? 'w-96' : 'w-14'} shadow-2xl z-[100] transition-all duration-300 ease-in-out border-l`}
      style={{
        backgroundColor: '#f8fafc',
        borderColor: "#E5E7EB"
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {!panelExpanded && (
          <div className="flex-1 flex flex-col items-center gap-3 pt-6 pb-4 bg-white pointer-events-auto">
            <button
              onClick={() => { setActiveTab('properties'); setPanelExpanded(true); }}
              className="w-8 h-8 rounded-xl border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
              title="Properties"
              aria-label="Open Properties"
            >
              🔧
            </button>
            <button
              onClick={() => { setActiveTab('ai'); setPanelExpanded(true); }}
              className="w-8 h-8 rounded-xl border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
              title="AI"
              aria-label="Open AI"
            >
              🤖
            </button>
            <button
              onClick={() => { setActiveTab('subservices'); setPanelExpanded(true); }}
              className="w-8 h-8 rounded-xl border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
              title="Sub-Services"
              aria-label="Open Sub-Services"
            >
              🧩
            </button>
          </div>
        )}
        {/* Header */}
        {panelExpanded && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: '#ffffff',
              borderColor: "#E5E7EB"
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Back to service list - close properties panel and open service modal
                      closePropertiesPanel();
                      if (service) {
                        openServiceModal(service);
                      }
                    }}
                    className="text-slate-700 hover:text-slate-900 text-lg font-bold w-6 h-6 flex items-center justify-center flex-shrink-0"
                    title="Back to service list"
                  >
                    ←
                  </button>
                  <div className="w-full">
                    <h2 className="text-lg font-bold truncate text-slate-800">{subService ? subService.name : service?.name || 'Service'}</h2>
                    <p className="text-slate-600 text-sm truncate">
                      {currentProvider.toUpperCase()}::{(service?.id || 'service').toUpperCase()}
                    </p>
                    {/* Tabs removed from header; added below in content */}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPanelExpanded(false)}
                className="text-slate-700 hover:text-slate-900 text-lg font-bold w-6 h-6 flex items-center justify-center flex-shrink-0"
                title="Collapse"
                aria-label="Collapse panel"
              >
                ›
              </button>
            </div>
            <div className="mt-1">
              <span className="inline-block text-xs px-2 py-0.5 rounded-md border bg-slate-100 text-slate-700">
                {editingNode?.properties?.status ?? 'Running'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {panelExpanded && (
          <div
            className="flex-1 p-6 overflow-y-auto w-full"
            style={{
              backgroundColor: '#f8fafc'
            }}
          >
            {/* Segmented Tabs (now below header border) */}
            <div className="inline-flex items-center justify-center p-1 w-full gap-1 rounded-full bg-slate-100 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className={`flex items-center flex-1 gap-2 text-sm px-4 py-1.5 rounded-full transition-colors ${activeTab === 'properties'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                <span className="text-base leading-none">🔧</span>
                Properties
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center justify-center flex-1 gap-2 text-sm px-4 py-1.5 rounded-full transition-colors ${activeTab === 'ai'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                <span className="text-base leading-none">🤖</span>
                AI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subservices')}
                className={`flex items-center justify-center flex-1 gap-2 text-sm px-4 py-1.5 rounded-full transition-colors ${activeTab === 'subservices'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                <span className="text-base leading-none">🧩</span>
                Sub-Services
              </button>
            </div>
            {activeTab === 'properties' ? (
              allProperties.length === 0 ? (
                <div className="space-y-4">
                  {state.placedNodes.length === 0 ? (
                    <div className="text-center py-8" style={{ color: theme.textSecondary }}>
                      <p>No services on canvas. Add items to see export data.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-slate-800">Canvas Nodes JSON</h4>
                        </div>
                        <div className="text-xs text-black p-0 rounded-lg bg-slate-50 border overflow-x-auto">
                          <div className="p-3">
                            {(() => {
                              const nodes = state.placedNodes
                                .filter((group: any) => group.parentNodeId !== "root" && group.parentNodeId !== null && group.parentNodeId !== undefined);
                              // console.log(nodes, "nodes");
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
                                const distinctServiceIds = Array.from(new Set(groupNodes.map((n: any) => n?.subServiceId || n?.icon?.id || 'unknown')));
                                const merged = mergeProps(groupNodes);
                                return { name, services: distinctServiceIds, properties: merged, nodes: groupNodes } as any;
                              });

                              // Helper: parse inbound rules text into port numbers
                              const parseInboundPorts = (text: any): number[] => {
                                if (typeof text !== 'string') return [];
                                const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
                                const ports: number[] = [];
                                for (const p of parts) {
                                  const match = p.match(/(\d{1,5})/);
                                  if (match) {
                                    const portStr = match[1];
                                    const parsed = parseInt(portStr, 10);
                                    if (!isNaN(parsed)) ports.push(parsed);
                                  }
                                }
                                return ports;
                              };
                              const terraformCode = exportGroups.map((group: any) => {
                                const { name, properties, services, nodes } = group;
                                const resName = sanitize(name);
                                const blocks: string[] = [];

                                // EC2-centric blocks (security group, instance, ebs, eip)
                                const hasEc2 = services.includes('ec2-instance');
                                if (hasEc2) {
                                  const sgResName = `ec2_instance_${resName}_sg`;
                                  const instanceResName = `ec2_instance_${resName}`;
                                  const volResName = `ec2_instance_${resName}_volume`;
                                  const attachResName = `ec2_instance_${resName}_attachment`;
                                  const eipResName = `ec2_instance_${resName}_eip`;
                                  // Security Group details
                                  const sgNode = nodes.find((n: any) => n?.subServiceId === 'security-group' || n?.icon?.id === 'security-group');
                                  const inboundText = (sgNode as any)?.properties?.inboundRules || '';
                                  const selectedGroupNames = Array.isArray(properties.securityGroups) ? properties.securityGroups : [];
                                  const selectedGroups = selectedGroupNames
                                    .map((nm: string) => allSecurityGroups.find((g: any) => g?.name === nm))
                                    .filter(Boolean);
                                  const portLabel = (p: number) => (p === 22 ? 'SSH' : p === 80 ? 'HTTP' : p === 443 ? 'HTTPS' : `Port ${p}`);
                                  const sgNameTag = selectedGroupNames.length ? selectedGroupNames[0] : ((sgNode as any)?.properties?.groupName || 'default-sg');
                                  const ports = parseInboundPorts(inboundText);

                                  // Build dynamic ingress/egress from selected groups; fallback to parsed inbound ports; no static defaults
                                  const ingressRules: Array<{ protocol: string; fromPort: number; toPort: number; cidr: string; description?: string }> =
                                    selectedGroups.length
                                      ? selectedGroups.flatMap((g: any) => (g?.ingress || []))
                                      : ports.map((p: number) => ({ protocol: 'tcp', fromPort: p, toPort: p, cidr: '0.0.0.0/0', description: portLabel(p) }));
                                  const egressRules: Array<{ protocol: string; fromPort: number; toPort: number; cidr: string; description?: string }> =
                                    selectedGroups.length
                                      ? selectedGroups.flatMap((g: any) => (g?.egress || []))
                                      : [];

                                  // EC2 instance properties
                                  const ami = properties.ami || (properties.AMI || 'ami-0abcdef1234567890');
                                  const instanceType = properties.instance_type || properties.instanceType || 't2.micro';
                                  const keyName = properties.key_name || properties.keyPair;

                                  // EBS volume properties
                                  const volSize = properties.size || properties.volumeSize || 20;
                                  const volType = properties.volumeType || 'gp3';
                                  const volEncrypted = typeof properties.encrypted === 'boolean' ? properties.encrypted : false;
                                  const deviceName = properties.deviceName || '/dev/xvdf';

                                  // Whether group contains Elastic IP sub-service
                                  const hasEip = nodes.some((n: any) => n?.subServiceId === 'elastic-ip' || n?.icon?.id === 'elastic-ip');
                                  const eipDomain = properties.domain || 'vpc';

                                  // Build SG block only if any rules are defined
                                  const sgBlockLines: string[] = [];
                                  if (ingressRules.length > 0 || egressRules.length > 0) {
                                    sgBlockLines.push(`resource \"aws_security_group\" \"${sgResName}\" {`);
                                    sgBlockLines.push(`  name        = \"${sgNameTag}\"`);
                                    sgBlockLines.push(`  description = \"${ingressRules.length ? 'Allow ' + ingressRules.map((r) => r.description || ((r.protocol === '-1' ? 'ALL' : r.protocol.toUpperCase()) + ' ' + r.fromPort)).join(', ') : 'Custom SG'}\"`);
                                    sgBlockLines.push(`  vpc_id      = \"your-vpc-id\" # Replace with your actual VPC ID`);
                                    for (const r of ingressRules) {
                                      sgBlockLines.push(`  ingress {`);
                                      sgBlockLines.push(`    description = \"${r.description || ''}\"`);
                                      sgBlockLines.push(`    from_port   = ${r.fromPort}`);
                                      sgBlockLines.push(`    to_port     = ${r.toPort}`);
                                      sgBlockLines.push(`    protocol    = \"${r.protocol}\"`);
                                      sgBlockLines.push(`    cidr_blocks = [\"${r.cidr}\"]`);
                                      sgBlockLines.push(`  }`);
                                    }
                                    for (const r of egressRules) {
                                      sgBlockLines.push(`  egress {`);
                                      sgBlockLines.push(`    from_port   = ${r.fromPort}`);
                                      sgBlockLines.push(`    to_port     = ${r.toPort}`);
                                      sgBlockLines.push(`    protocol    = \"${r.protocol}\"`);
                                      sgBlockLines.push(`    cidr_blocks = [\"${r.cidr}\"]`);
                                      sgBlockLines.push(`  }`);
                                    }
                                    sgBlockLines.push(`  tags = {`);
                                    sgBlockLines.push(`    Name = \"${sgNameTag}\"`);
                                    sgBlockLines.push(`  }`);
                                    sgBlockLines.push(`}`);
                                  }

                                  // Build EC2 instance block
                                  const ec2Lines: string[] = [];
                                  ec2Lines.push(`resource \"aws_instance\" \"${instanceResName}\" {`);
                                  ec2Lines.push(`  ami                    = \"${ami}\"`);
                                  ec2Lines.push(`  instance_type          = \"${instanceType}\"`);
                                  if (keyName) ec2Lines.push(`  key_name               = \"${keyName}\"`);
                                  if (sgBlockLines.length > 0) ec2Lines.push(`  vpc_security_group_ids = [aws_security_group.${sgResName}.id]`);
                                  ec2Lines.push(`  tags = {`);
                                  ec2Lines.push(`    Name = \"${name}\"`);
                                  ec2Lines.push(`  }`);
                                  ec2Lines.push(`}`);

                                  // Build EBS volume & attachment blocks
                                  const ebsLines: string[] = [];
                                  ebsLines.push(`resource \"aws_ebs_volume\" \"${volResName}\" {`);
                                  ebsLines.push(`  availability_zone = aws_instance.${instanceResName}.availability_zone`);
                                  ebsLines.push(`  size              = ${volSize}`);
                                  ebsLines.push(`  type              = \"${volType}\"`);
                                  ebsLines.push(`  encrypted         = ${volEncrypted ? 'true' : 'false'}`);
                                  ebsLines.push(`  tags = {`);
                                  ebsLines.push(`    Name = \"${name}-volume\"`);
                                  ebsLines.push(`  }`);
                                  ebsLines.push(`}`);
                                  ebsLines.push(`resource \"aws_volume_attachment\" \"${attachResName}\" {`);
                                  ebsLines.push(`  device_name = \"${deviceName}\"`);
                                  ebsLines.push(`  volume_id   = aws_ebs_volume.${volResName}.id`);
                                  ebsLines.push(`  instance_id = aws_instance.${instanceResName}.id`);
                                  ebsLines.push(`}`);

                                  // Optional EIP block
                                  const eipLines: string[] = [];
                                  if (hasEip) {
                                    eipLines.push(`resource \"aws_eip\" \"${eipResName}\" {`);
                                    eipLines.push(`  instance = aws_instance.${instanceResName}.id`);
                                    eipLines.push(`  domain   = \"${eipDomain}\"`);
                                    eipLines.push(`  tags = {`);
                                    eipLines.push(`    Name = \"${name}-eip\"`);
                                    eipLines.push(`  }`);
                                    eipLines.push(`}`);
                                  }

                                  blocks.push(
                                    [
                                      sgBlockLines.length ? sgBlockLines.join('\n') : '',
                                      ec2Lines.join('\n'),
                                      ebsLines.join('\n'),
                                      eipLines.join('\n'),
                                    ].filter(Boolean).join('\n')
                                  );
                                }

                                // S3 bucket and related split resources
                                const s3Node = nodes.find((n: any) => n?.subServiceId === 's3-bucket' || n?.icon?.id === 's3-bucket');

                                if (s3Node) {
                                  let bucketName = (s3Node as any)?.properties?.bucketName || properties.bucketName || '';
                                  if (!bucketName) {
                                    const parent = state.placedNodes.find((pn: any) => pn?.id === (s3Node as any)?.parentNodeId);
                                    bucketName = (parent as any)?.properties?.bucketName || 'my-s3-bucket';
                                  }
                                  const s3ResName = `s3_bucket_${sanitize(bucketName)}`;
                                  const forceDestroy = typeof ((s3Node as any)?.properties?.forceDestroy ?? properties.forceDestroy) === 'boolean'
                                    ? ((s3Node as any)?.properties?.forceDestroy ?? properties.forceDestroy)
                                    : false;
                                  const blockPublic = typeof ((s3Node as any)?.properties?.publicAccess ?? properties.publicAccess) === 'boolean'
                                    ? ((s3Node as any)?.properties?.publicAccess ?? properties.publicAccess)
                                    : true;
                                  const versioningEnabled = !!(((s3Node as any)?.properties?.versioning ?? properties.versioning) || false);
                                  const accelEnabled = !!(((s3Node as any)?.properties?.acceleration ?? properties.acceleration) || false);
                                  const sseAlgorithm = (s3Node as any)?.properties?.sseAlgorithm || properties.sseAlgorithm || '';
                                  const kmsKeyId = (s3Node as any)?.properties?.kmsKeyId || properties.kmsKeyId || '';
                                  const bucketKeyEnabled = !!(((s3Node as any)?.properties?.bucketKeyEnabled ?? properties.bucketKeyEnabled) || false);
                                  const websiteIndex = (s3Node as any)?.properties?.websiteIndexDocument || properties.websiteIndexDocument || '';
                                  const websiteError = (s3Node as any)?.properties?.websiteErrorDocument || properties.websiteErrorDocument || '';

                                  // Derive lifecycle from s3-lifecycle child if present
                                  let transitionDays: number | undefined;
                                  let expirationDays: number | undefined;
                                  const S3Group = groups.filter((item: any) => item.subServiceId === "s3-lifecycle")
                                  {
                                    const parentId = (s3Node as any)?.parentNodeId;
                                    if (parentId) {
                                      const lifecycleNode = state.placedNodes.find(
                                        (n: any) => (n?.subServiceId === 's3-lifecycle' || n?.icon?.id === 's3-lifecycle') && n?.parentNodeId === parentId
                                      );
                                      if (lifecycleNode) {
                                        const t = (lifecycleNode as any)?.properties?.transitionDays;
                                        const e = (lifecycleNode as any)?.properties?.expirationDays;
                                        if (typeof t === 'number') transitionDays = t;
                                        else if (typeof t === 'string' && t.trim() !== '' && !isNaN(Number(t))) transitionDays = Number(t);
                                        if (typeof e === 'number') expirationDays = e;
                                        else if (typeof e === 'string' && e.trim() !== '' && !isNaN(Number(e))) expirationDays = Number(e);
                                      }
                                    }
                                    // Fallback to direct bucket/group properties if lifecycle child not provided
                                    if (expirationDays === undefined) {
                                      const expProp = (s3Node as any)?.properties?.expirationDays ?? properties.expirationDays;
                                      if (typeof expProp === 'number' && isFinite(expProp)) expirationDays = expProp;
                                      else if (typeof expProp === 'string' && expProp.trim() !== '' && !isNaN(Number(expProp))) expirationDays = Number(expProp);
                                    }
                                    if (transitionDays === undefined) {
                                      const transProp = (s3Node as any)?.properties?.transitionDays ?? properties.transitionDays;
                                      if (typeof transProp === 'number' && isFinite(transProp)) transitionDays = transProp;
                                      else if (typeof transProp === 'string' && transProp.trim() !== '' && !isNaN(Number(transProp))) transitionDays = Number(transProp);
                                    }
                                  }
                                  // Object lock: accept boolean or string; fallback to var
                                  const objectLockEnabledProp = (s3Node as any)?.properties?.objectLockEnabled ?? properties.objectLockEnabled;
                                  let objectLockEnabledValue: string | undefined;
                                  if (typeof objectLockEnabledProp === 'boolean') {
                                    objectLockEnabledValue = objectLockEnabledProp ? 'Enabled' : 'Disabled';
                                  } else if (typeof objectLockEnabledProp === 'string') {
                                    const s = objectLockEnabledProp.trim().toLowerCase();
                                    if (s === 'enabled' || s === 'true') objectLockEnabledValue = 'Enabled';
                                    else if (s === 'disabled' || s === 'false') objectLockEnabledValue = 'Disabled';
                                  }

                                  // Storage class: prefer explicit bucket storageClass, else derive default or use var
                                  const storageClassProp = (s3Node as any)?.properties?.storageClass ?? properties.storageClass;
                                  let storageClassValue: string | undefined;
                                  if (typeof storageClassProp === 'string' && storageClassProp.trim()) {
                                    storageClassValue = storageClassProp.trim();
                                  } else if (typeof transitionDays === 'number') {
                                    storageClassValue = 'STANDARD_IA';
                                  }

                                  const s3Blocks: string[] = [];
                                  s3Blocks.push(`resource \"aws_s3_bucket\" \"${s3ResName}\" {`);
                                  s3Blocks.push(`  bucket        = \"${bucketName}\"`);
                                  s3Blocks.push(`  acl           = \"${blockPublic ? 'private' : 'public-read'}\"`);
                                  s3Blocks.push(`  force_destroy = ${forceDestroy ? 'true' : 'false'}`);
                                  s3Blocks.push(`  lifecycle_rule {`);
                                  s3Blocks.push(`    expiration {`);
                                  s3Blocks.push(`      days = ${typeof expirationDays === 'number' ? expirationDays : '\${var.s3_expiration_days}'}`);
                                  s3Blocks.push(`    }`);
                                  s3Blocks.push(`    transition {`);
                                  s3Blocks.push(`      storage_class = ${storageClassValue ? '"' + storageClassValue + '"' : '\${var.s3_storage_class}'}`);
                                  s3Blocks.push(`      days          = ${typeof transitionDays === 'number' ? transitionDays : '\${var.s3_transition_days}'}`);
                                  s3Blocks.push(`    }`);
                                  s3Blocks.push(`  }`);
                                  s3Blocks.push(`  object_lock_configuration {`);
                                  s3Blocks.push(`    object_lock_enabled = ${objectLockEnabledValue ? '"' + objectLockEnabledValue + '"' : 'var.s3_object_lock_enabled'}`);
                                  s3Blocks.push(`  }`);
                                  if (accelEnabled) {
                                    s3Blocks.push(`  acceleration_status = \"Enabled\"`);
                                  }
                                  s3Blocks.push(`}`);

                                  if (websiteIndex || websiteError) {
                                    s3Blocks.push(`# S3 website configuration`);
                                    s3Blocks.push(`resource \"aws_s3_bucket_website_configuration\" \"${s3ResName}\" {`);
                                    s3Blocks.push(`  bucket = aws_s3_bucket.${s3ResName}.id`);
                                    if (websiteIndex) {
                                      s3Blocks.push(`  index_document {`);
                                      s3Blocks.push(`    suffix = \"${websiteIndex}\"`);
                                      s3Blocks.push(`  }`);
                                    }
                                    if (websiteError) {
                                      s3Blocks.push(`  error_document {`);
                                      s3Blocks.push(`    key = \"${websiteError}\"`);
                                      s3Blocks.push(`  }`);
                                    }
                                    s3Blocks.push(`}`);
                                  }

                                  blocks.push(s3Blocks.join('\n'));
                                }

                                // Lambda function and optional layer
                                const lambdaNode = nodes.find((n: any) => n?.subServiceId === 'lambda-function' || n?.icon?.id === 'lambda-function');
                                if (lambdaNode) {
                                  const functionName = (lambdaNode as any)?.properties?.functionName || properties.functionName || resName;
                                  const runtime = (lambdaNode as any)?.properties?.runtime || properties.runtime || 'nodejs18.x';
                                  const handler = (lambdaNode as any)?.properties?.handler || properties.handler || 'index.handler';
                                  const role = (lambdaNode as any)?.properties?.role || (lambdaNode as any)?.properties?.iamRole || properties.role || 'arn:aws:iam::123456789012:role/example';
                                  const lfName = `lambda_${sanitize(functionName)}`;

                                  const lambdaLines: string[] = [];
                                  lambdaLines.push(`resource \"aws_lambda_function\" \"${lfName}\" {`);
                                  lambdaLines.push(`  function_name = \"${functionName}\"`);
                                  lambdaLines.push(`  role          = \"${role}\"`);
                                  lambdaLines.push(`  handler       = \"${handler}\"`);
                                  lambdaLines.push(`  runtime       = \"${runtime}\"`);
                                  lambdaLines.push(`  tags = {`);
                                  lambdaLines.push(`    Name = \"${functionName}\"`);
                                  lambdaLines.push(`  }`);
                                  lambdaLines.push(`}`);

                                  const layerNode = nodes.find((n: any) => n?.subServiceId === 'lambda-layer' || n?.icon?.id === 'lambda-layer');
                                  if (layerNode) {
                                    const layerName = (layerNode as any)?.properties?.layerName || 'layer';
                                    const compat = (layerNode as any)?.properties?.compatibleRuntimes || [runtime];
                                    const layerRes = `lambda_layer_${sanitize(layerName)}`;
                                    const layerLines: string[] = [];
                                    layerLines.push(`resource \"aws_lambda_layer_version\" \"${layerRes}\" {`);
                                    layerLines.push(`  layer_name          = \"${layerName}\"`);
                                    layerLines.push(`  compatible_runtimes = ${JSON.stringify(compat)}`);
                                    layerLines.push(`}`);
                                    blocks.push(layerLines.join('\n'));
                                  }

                                  blocks.push(lambdaLines.join('\n'));
                                }

                                // RDS instance
                                const rdsNode = nodes.find((n: any) => n?.subServiceId === 'rds-instance' || n?.icon?.id === 'rds-instance');
                                if (rdsNode) {
                                  const identifier = (rdsNode as any)?.properties?.identifier || properties.identifier || resName;
                                  const engine = (rdsNode as any)?.properties?.engine || properties.engine || 'mysql';
                                  const instanceClass = (rdsNode as any)?.properties?.instanceClass || properties.instanceClass || 'db.t3.micro';
                                  const allocatedStorage = (rdsNode as any)?.properties?.allocatedStorage || properties.allocatedStorage || 20;
                                  const engineVersion = (rdsNode as any)?.properties?.engineVersion || properties.engineVersion || '8.0';
                                  const publiclyAccessible = !!(((rdsNode as any)?.properties?.publiclyAccessible ?? properties.publiclyAccessible) || false);
                                  const rdsRes = `db_${sanitize(identifier)}`;

                                  const rdsLines: string[] = [];
                                  rdsLines.push(`resource \"aws_db_instance\" \"${rdsRes}\" {`);
                                  rdsLines.push(`  identifier         = \"${identifier}\"`);
                                  rdsLines.push(`  engine             = \"${engine}\"`);
                                  rdsLines.push(`  engine_version     = \"${engineVersion}\"`);
                                  rdsLines.push(`  instance_class     = \"${instanceClass}\"`);
                                  rdsLines.push(`  allocated_storage  = ${allocatedStorage}`);
                                  rdsLines.push(`  publicly_accessible = ${publiclyAccessible ? 'true' : 'false'}`);
                                  rdsLines.push(`  skip_final_snapshot = true`);
                                  rdsLines.push(`  tags = {`);
                                  rdsLines.push(`    Name = \"${identifier}\"`);
                                  rdsLines.push(`  }`);
                                  rdsLines.push(`}`);
                                  blocks.push(rdsLines.join('\n'));
                                }

                                // VPC
                                const vpcNode = nodes.find((n: any) => n?.subServiceId === 'vpc' || n?.icon?.id === 'vpc');
                                if (vpcNode) {
                                  const vpcName = (vpcNode as any)?.properties?.vpcName || properties.vpcName || resName;
                                  const cidr = (vpcNode as any)?.properties?.cidrBlock || properties.cidrBlock || '10.0.0.0/16';
                                  const vpcRes = `vpc_${sanitize(vpcName)}`;
                                  const vpcLines: string[] = [];
                                  vpcLines.push(`resource \"aws_vpc\" \"${vpcRes}\" {`);
                                  vpcLines.push(`  cidr_block = \"${cidr}\"`);
                                  vpcLines.push(`  tags = {`);
                                  vpcLines.push(`    Name = \"${vpcName}\"`);
                                  vpcLines.push(`  }`);
                                  vpcLines.push(`}`);
                                  blocks.push(vpcLines.join('\n'));
                                }

                                // CloudFront (minimal)
                                const cfNode = nodes.find((n: any) => n?.subServiceId === 'cloudfront-distribution' || n?.icon?.id === 'cloudfront-distribution');
                                if (cfNode) {
                                  const distName = (cfNode as any)?.properties?.distributionName || properties.distributionName || resName;
                                  const originDomain = (cfNode as any)?.properties?.originDomain || properties.originDomain || `${resName}.s3.amazonaws.com`;
                                  const cfRes = `cloudfront_${sanitize(distName)}`;
                                  const cfLines: string[] = [];
                                  cfLines.push(`resource \"aws_cloudfront_distribution\" \"${cfRes}\" {`);
                                  cfLines.push(`  enabled = true`);
                                  cfLines.push(`  origin {`);
                                  cfLines.push(`    domain_name = \"${originDomain}\"`);
                                  cfLines.push(`    origin_id   = \"${distName}-origin\"`);
                                  cfLines.push(`  }`);
                                  cfLines.push(`  default_cache_behavior {`);
                                  cfLines.push(`    target_origin_id = \"${distName}-origin\"`);
                                  cfLines.push(`    viewer_protocol_policy = \"redirect-to-https\"`);
                                  cfLines.push(`    allowed_methods = [\"GET\", \"HEAD\"]`);
                                  cfLines.push(`    cached_methods  = [\"GET\", \"HEAD\"]`);
                                  cfLines.push(`  }`);
                                  cfLines.push(`  restrictions {`);
                                  cfLines.push(`    geo_restriction { restriction_type = \"none\" }`);
                                  cfLines.push(`  }`);
                                  cfLines.push(`  viewer_certificate {`);
                                  cfLines.push(`    cloudfront_default_certificate = true`);
                                  cfLines.push(`  }`);
                                  cfLines.push(`}`);
                                  blocks.push(cfLines.join('\n'));
                                }

                                if (blocks.length === 0) return '';
                                return blocks.join('\n');
                              }).filter(Boolean).join('\n\n');

                              return (
                                <pre className="text-xs text-slate-700 whitespace-pre">{terraformCode}</pre>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Common Properties */}
                  {service?.commonProperties && service.commonProperties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3">Basic Information</h3>
                      <div className="space-y-3">
                        {service.commonProperties.map((property) => (
                          <div key={property.id} className="p-4 rounded-xl border bg-white" >
                            <div className="flex items-center justify-between mb-1">
                              <label
                                className="text-xs font-medium text-slate-700"
                              >
                                {property.name}
                              </label>
                              {property.required && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded border bg-slate-100 text-slate-700"
                                >
                                  Required
                                </span>
                              )}
                            </div>
                            {property.description && (
                              <p className="text-xs mb-2 text-slate-600">
                                {property.description}
                              </p>
                            )}
                            {renderPropertyInput(property)}
                            {errors[property.id] && (
                              <p className="text-red-500 text-xs mt-1">{errors[property.id]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-Service Properties */}
                  {subService?.properties && subService.properties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3">Configuration</h3>
                      <div className="space-y-3">
                        {subService.properties.map((property) => (
                          <div key={property.id} className="p-4 rounded-xl border bg-white" >
                            <div className="flex items-center justify-between mb-1">
                              <label
                                className="text-xs font-medium text-slate-700"
                              >
                                {property.name}
                              </label>
                              {property.required && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded border bg-slate-100 text-slate-700"
                                >
                                  Required
                                </span>
                              )}
                            </div>
                            {property.description && (
                              <p className="text-xs mb-2 text-slate-600">{property.description}</p>
                            )}
                            {renderPropertyInput(property)}
                            {errors[property.id] && (
                              <p className="text-red-500 text-xs mt-1">{errors[property.id]}</p>
                            )}
                          </div>
                        ))}

                        {!(
                          editingNode?.subServiceId === 's3-bucket' ||
                          editingNode?.subServiceId === 's3-lifecycle' ||
                          editingNode?.subServiceId === "ec2-instance" ||
                          (editingNode?.serviceId === "ec2" && editingNode?.subServiceId != "security-group") ||
                          editingNode?.subServiceId === "ebs-volume"
                        ) && (
                            <div className="p-4 rounded-xl border bg-white mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-slate-700">Global Security Groups</label>
                                <span className="text-xs px-2 py-0.5 rounded border bg-green-50 text-green-700">Selectable</span>
                              </div>
                              <p className="text-xs mb-2 text-slate-600">Dropdown se groups select karo aur EC2 par apply ho jayenge.</p>
                              {(() => {
                                const names = selectedSecurityGroups;
                                const nameToId = (nm: string) => allSecurityGroups.find((g) => g.name === nm)?.id || '';
                                const idToName = (id: string) => allSecurityGroups.find((g) => g.id === id)?.name || '';
                                const selectedIds = names.map(nameToId).filter(Boolean);
                                const handleIdsChange = (ids: string[]) => {
                                  const nextNames = ids.map(idToName).filter((s) => s && s.trim());
                                  setSelectedSecurityGroups(nextNames);
                                  updateEc2SecurityGroups((editingNode as any).id, nextNames);
                                };
                                return (
                                  <SecurityGroupDropdown selectedIds={selectedIds} onChange={handleIdsChange} allowMulti buttonLabel={'Open Security Groups'} />
                                );
                              })()}
                              {/* Selected SG chips with remove (cross) */}
                              <div className="mt-2 flex flex-wrap gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
                                {securityTabs.length === 0 && (
                                  <span className="text-[11px] text-slate-500">No security groups selected</span>
                                )}
                                {securityTabs?.map((name: string, i: number) => {
                                  const removeOne = () => {
                                    const next = selectedSecurityGroups.filter((n) => n !== name);
                                    setSelectedSecurityGroups(next);
                                    updateEc2SecurityGroups((editingNode as any).id, next);
                                  };
                                  return (
                                    <span key={`${name}-${i}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[12px]">
                                      {name}
                                      <button
                                        type="button"
                                        className="ml-1 w-4 h-4 inline-flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label={`Remove ${name}`}
                                        title={`Remove ${name}`}
                                        onClick={removeOne}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {!(editingNode?.subServiceId === 's3-bucket' || (editingNode as any)?.icon?.id === 's3-bucket') && sgModalOpen && (
                          <SecurityGroupModal
                            open={sgModalOpen}
                            onClose={() => setSgModalOpen(false)}
                            initialGroup={allSecurityGroups.find((x) => x.id === sgEditTargetId) || null}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cost Estimation */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Cost Estimation</h3>
                    <div className="p-4 rounded-xl border bg-green-50" style={{ borderColor: '#86efac' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-semibold">$</div>
                        <div>
                          <div className="text-slate-800 font-semibold">$ {editingNode?.properties?.estimatedMonthly ?? '—'}/mo</div>
                          <div className="text-xs text-slate-600">Click to view detailed cost breakdown for all services</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Script for selected element */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 mb-2">Script</h3>
                    <div className="p-4 rounded-xl border bg-white" style={{ borderColor: theme.border }}>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap break-all">
                        {scriptObject
                          ? JSON.stringify(scriptObject, null, 2)
                          : (editingNode?.properties?.script || '—')}
                      </pre>
                    </div>
                  </div>

                  {/* Listeners section for Load Balancer-style UI */}
                  {listeners.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800 mb-2">Listeners</h3>
                      <div className="space-y-2">
                        {listeners.map((l, idx) => (
                          <div key={idx} className="rounded-lg border bg-slate-100 text-slate-800 p-3" style={{ borderColor: theme.border }}>
                            <div className="font-medium text-sm">{l.protocol}: {l.port}</div>
                            <div className="text-xs text-slate-600">Forward to: {l.target}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setListeners(prev => [...prev, { protocol: 'HTTPS', port: 443, target: 'tg-web-servers' }])}
                        className="mt-2 text-blue-700 text-xs hover:text-blue-600"
                      >
                        Add listener
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : activeTab === 'ai' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">AI Infrastructure Validator</h3>
                    <p className="text-sm text-slate-600">Gain insights on your multi-cloud setup.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-800 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Validate Infrastructure', icon: '✅', color: 'bg-green-50 border-green-200' },
                      { label: 'Suggest Optimization', icon: '💰', color: 'bg-yellow-50 border-yellow-200' },
                      { label: 'Security /Compliance Review', icon: '🔒', color: 'bg-red-50 border-red-200' },
                      { label: 'Optimized Performance', icon: '⚡', color: 'bg-blue-50 border-blue-200' },
                    ].map((item, idx) => (
                      <button key={idx} type="button" className={`p-3 rounded-lg border text-left hover:shadow-sm transition-all ${item.color}`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-xs text-slate-800 font-medium leading-tight">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-white" >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🤖</div>
                        <span className="text-xs text-slate-600">06:42 PM</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium">Validation</span>
                    </div>
                    <div className="text-sm text-slate-800">
                      <p className="mb-2">👋 Hi! I'm your validation assistant. I can help you:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700">
                        <li>Validate architecture</li>
                        <li>Suggest cost optimizations</li>
                        <li>Review security practices</li>
                        <li>Recommend performance improvements</li>
                      </ul>
                      <p className="mt-3 font-medium">How can I assist you today?</p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white border rounded-lg px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: theme.border }}
                      placeholder="Inquire about infrastructure validation, security, costs, or optimizations."
                      readOnly
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors">
                      <span className="text-sm">➤</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 text-center">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-lg">🧩</div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Sub-Services</h3>
                    <p className="text-sm text-slate-600">Browse and configure sub-services for the selected service.</p>
                  </div>
                </div>
                {(!service || subServicesList.length === 0) ? (
                  <div className="text-center py-8" style={{ color: theme.textSecondary }}>
                    <p>Select a service to view available sub-services</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {(service?.id === 'ec2' ? subServicesList.filter((sub: any) => sub?.id !== 'security-group') : subServicesList).map((sub: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border bg-white hover:shadow-sm transition-all">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{sub.icon || '🧩'}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-800 truncate">{sub.name}</div>
                            {sub.description && (
                              <div className="text-[11px] text-slate-600 truncate">{sub.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <button
                            type="button"
                            className="text-xs px-2 py-1 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                            onClick={() => {
                              if (service) {
                                openPropertiesPanel(service as any, sub as any);
                                setActiveTab('properties');
                              }
                            }}
                          >
                            Configure
                          </button>
                          <button
                            type="button"
                            className="text-xs px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              if (service) {
                                openPropertiesPanel(service as any, sub as any);
                                setActiveTab('properties');
                              }
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {panelExpanded && (
          <div className="px-4 py-3 border-t" style={{ backgroundColor: '#ffffff', borderColor: theme.border }}>
            <div className="flex justify-between items-center text-sm">
              <div className="text-slate-600">
                {allProperties.length} properties
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={closePropertiesPanel}
                  className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded text-xs hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs hover:bg-slate-800 transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PropertiesPanel };