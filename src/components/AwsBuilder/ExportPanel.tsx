import React, { useState } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

// Summary: Export Panel component - handles export to Draw.io format
// - Generates XML compatible with Draw.io/diagrams.net

export function ExportPanel() {
  const { state } = useAwsBuilder();
  const [isExporting, setIsExporting] = useState(false);

  // Build per-instance JSON object in required shape
  const buildRequestedJSONFormat = () => {
    const sanitize = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

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

        // Attempt to resolve connected VPC Subnet and map to subnet_id
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
              // Prefer explicit subnetId if present, otherwise name, then CIDR
              return props.subnetId || props.subnetName || props.subnetCidr || '';
            }
          }
          return '';
        };

        // Try to fetch friendly instance name from parent EC2 common properties
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
            tags: {
              Name: nameTag,
              Environment: 'Production',
            },
          },
        };
      });

    // S3 Buckets
    const s3BucketResources = state.placedNodes
      .filter((node) => node.subServiceId === 's3-bucket' || node.icon.id === 's3-bucket')
      .map((node) => {
        // Resolve bucket name from parent S3 node common properties
        let bucketName: string = '';
        if ((node as any)?.parentNodeId) {
          const parent = state.placedNodes.find((n) => n.id === (node as any).parentNodeId);
          const maybeBucket = (parent as any)?.properties?.bucketName;
          if (typeof maybeBucket === 'string' && maybeBucket.trim()) {
            bucketName = maybeBucket.trim();
          }
        }
        // Fallbacks
        if (!bucketName) {
          const maybeOwnBucket = (node as any)?.properties?.bucketName;
          if (typeof maybeOwnBucket === 'string' && maybeOwnBucket.trim()) {
            bucketName = maybeOwnBucket.trim();
          }
        }
        if (!bucketName) bucketName = 'my-s3-bucket';

        const storageClass = (node as any)?.properties?.storageClass || 'STANDARD';
        const versioning = Boolean((node as any)?.properties?.versioning);
        const blockPublicAccess = (node as any)?.properties?.publicAccess;
        const blockPublic = typeof blockPublicAccess === 'boolean' ? blockPublicAccess : true; // default blocks public access

        const resourceName = sanitize(bucketName);

        // Locate sibling lifecycle sub-service for this bucket (same parent)
        let lifecycle: { transition_days?: number; expiration_days?: number } | undefined;
        const parentId = (node as any)?.parentNodeId;
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

        return {
          type: 'aws_s3_bucket',
          name: resourceName,
          properties: {
            bucket: bucketName,
            acl: blockPublic ? 'private' : 'public-read',
            storage_class: storageClass,
            versioning: { enabled: versioning },
            block_public_access: blockPublic,
            tags: {
              Name: bucketName,
              Environment: 'Production',
            },
            ...(lifecycle ? { lifecycle } : {}),
          },
        };
      });

    // Lambda Functions
    const lambdaResources = state.placedNodes
      .filter((node) => node.subServiceId === 'lambda-function' || node.icon.id === 'lambda-function')
      .map((node) => {
        // Resolve function name and runtime from parent Lambda service
        let functionName: string = '';
        let runtime: string = '';
        if ((node as any)?.parentNodeId) {
          const parent = state.placedNodes.find((n) => n.id === (node as any).parentNodeId);
          const maybeFn = (parent as any)?.properties?.functionName;
          const maybeRt = (parent as any)?.properties?.runtime;
          if (typeof maybeFn === 'string' && maybeFn.trim()) functionName = maybeFn.trim();
          if (typeof maybeRt === 'string' && maybeRt.trim()) runtime = maybeRt.trim();
        }
        // Fallbacks
        if (!functionName) functionName = (node.icon.name || 'MyLambdaFunction').toString();
        if (!runtime) runtime = 'nodejs18.x';

        const handler = (node as any)?.properties?.handler || 'index.handler';
        // Optional role if present anywhere; fallback to a generic execution role ARN
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
            tags: {
              Name: nameTag,
            },
          },
        };
      });

    // RDS Database Instances
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
        if (!identifier) identifier = (node.icon.name || 'my-database').toString();

        const engine = (node as any)?.properties?.engine || 'mysql';
        const instanceClass = (node as any)?.properties?.instanceClass || 'db.t3.micro';
        const alloc = (node as any)?.properties?.allocatedStorage;
        const allocated_storage = typeof alloc === 'number' ? alloc : 20;
        const engineVersion = (node as any)?.properties?.engineVersion;
        const publiclyAccessible = (node as any)?.properties?.publiclyAccessible;

        // Locate sibling DB Subnet Group for this instance (same parent)
        let dbSubnetGroupName: string | undefined;
        if (parentId) {
          const subnetGroup = state.placedNodes.find(
            (n) => (n.subServiceId === 'rds-subnet-group' || n.icon.id === 'rds-subnet-group') && n.parentNodeId === parentId
          );
          const maybeSubnet = (subnetGroup as any)?.properties?.subnetGroupName;
          if (typeof maybeSubnet === 'string' && maybeSubnet.trim()) dbSubnetGroupName = maybeSubnet.trim();
        }

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
            db_name: "mydatabase",
            username: "dbadmin",
            password: "SECRET_PASSWORD_PLACEHOLDER",
            skip_final_snapshot: true,
            tags: {
              Name: identifier,
            },
          },
        };
      });

    // VPC Networks (export root VPC nodes)
    const vpcRootNodes = state.placedNodes.filter(
      (node) => ((node as any)?.serviceId === 'vpc' && !(node as any)?.subServiceId) || node.icon.id === 'vpc'
    );
    let vpcResources = vpcRootNodes.map((vpcNode) => {
      const vpcName = (vpcNode as any)?.properties?.vpcName || vpcNode.icon.name || 'MyVPC';
      const cidrBlock = (vpcNode as any)?.properties?.cidrBlock || '10.0.0.0/16';
      const resourceName = sanitize(vpcName);
      return {
        type: 'aws_vpc',
        name: resourceName,
        properties: {
          cidr_block: cidrBlock,
          enable_dns_hostnames: true,
          tags: {
            Name: vpcName,
          },
        },
      };
    });

    // Fallback: derive VPC from children if no root VPC nodes explicitly placed
    if (vpcResources.length === 0) {
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
      vpcResources = Array.from(vpcParents.values()).map((vpcNode: any) => {
        const vpcName = vpcNode?.properties?.vpcName || vpcNode.icon.name || 'MyVPC';
        const cidrBlock = vpcNode?.properties?.cidrBlock || '10.0.0.0/16';
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
    }

    // CloudFront Distributions
    const cloudfrontResources = state.placedNodes
      .filter((node) => node.subServiceId === 'cf-distribution' || node.icon.id === 'cf-distribution')
      .map((node) => {
        // Resolve distribution name from parent common properties if present
        let distributionName: string = '';
        const parentId = (node as any)?.parentNodeId;
        if (parentId) {
          const parent = state.placedNodes.find((n) => n.id === parentId);
          const maybeName = (parent as any)?.properties?.distributionName;
          if (typeof maybeName === 'string' && maybeName.trim()) distributionName = maybeName.trim();
        }
        if (!distributionName) distributionName = (node.icon.name || 'my_cdn_distribution').toString();

        // Origin domain from node property, fallback to a sample S3 domain
        let originDomain = (node as any)?.properties?.originDomain;
        if (typeof originDomain !== 'string' || !originDomain.trim()) {
          originDomain = 'my_app_storage_bucket.s3.amazonaws.com';
        }

        // Try to resolve connected S3 bucket to derive origin_id
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
              // Prefer parent S3 common property bucketName
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
            origin: {
              domain_name: originDomain,
              origin_id: originId,
            },
            enabled: true,
            is_ipv6_enabled: true,
            default_cache_behavior: {
              target_origin_id: originId,
              viewer_protocol_policy: 'redirect-to-https',
              allowed_methods: ['GET', 'HEAD', 'OPTIONS'],
              cached_methods: ['GET', 'HEAD'],
            },
            restrictions: {
              geo_restriction: {
                restriction_type: 'none',
              },
            },
            viewer_certificate: {
              cloudfront_default_certificate: true,
            },
          },
        };
      });

    return [
      ...ec2Resources,
      ...s3BucketResources,
      ...lambdaResources,
      ...rdsResources,
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
    const compiled = { resources };
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

  const getAwsRegionFromNodes = (): string => {
    // Try to read a configured region from any node properties, default to us-east-1
    for (const n of state.placedNodes) {
      const region = (n as any)?.properties?.region;
      if (typeof region === 'string' && region.trim()) return region;
    }
    return 'us-east-1';
  };

  const generateTerraformHCL = (): string => {
    const providerBlock = `provider "aws" {\n  region = "${getAwsRegionFromNodes()}"\n}`;

    const resources: string[] = [];

    state.placedNodes.forEach((node) => {
      const isEc2Instance = node.subServiceId === 'ec2-instance' || node.icon.id === 'ec2-instance';
      if (!isEc2Instance) return;

      const ami = (node as any)?.properties?.ami || 'ami-0c55b159cbfafe1f0';
      const instanceType = (node as any)?.properties?.instanceType || 't2.micro';
      const nameTag = (node as any)?.properties?.name || node.icon.name || 'web_server';
      const resourceName = sanitizeResourceName(nameTag);

      resources.push(`resource "aws_instance" "${resourceName}" {\n  ami           = "${ami}"\n  instance_type = "${instanceType}"\n\n  tags = {\n    Name = "${nameTag}"\n  }\n}`);
    });

    return [providerBlock, ...resources].join('\n\n');
  };

  const handleExportTerraform = () => {
    // For now, support AWS EC2 Instance export
    const hcl = generateTerraformHCL();

    if (!hcl || !hcl.includes('resource "aws_instance"')) {
      alert('No EC2 Instance found to export. Add an EC2 Instance sub-service.');
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
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🌐</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Open in Draw.io</div>
            <div className="text-xs text-gray-500">Open directly in browser</div>
          </div>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJSON}
          disabled={state.placedNodes.length === 0}
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">📋</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Export JSON</div>
            <div className="text-xs text-gray-500">Save as JSON data</div>
          </div>
        </button>

        {/* Export Terraform (HCL) */}
        <button
          onClick={handleExportTerraform}
          disabled={state.placedNodes.length === 0}
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🧱</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Export Terraform</div>
            <div className="text-xs text-gray-500">Provider + aws_instance (AWS)</div>
          </div>
        </button>
      </div>
    </div>
  );
}