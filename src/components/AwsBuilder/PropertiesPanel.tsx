import React, { useState, useEffect, useMemo } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { useCloudProvider } from '@/context/CloudProviderContext';
import { getProviderTheme } from '@/data/theme-colors';
import { ServiceProperty, SubService, DetailedAwsService } from '../../data/aws-services-detailed';

// Summary: Properties Panel component - shows configuration options for selected service/sub-service
// - Displays properties form and allows saving configuration

const PropertiesPanel: React.FC = () => {
  const { currentProvider } = useCloudProvider();
  const { state, closePropertiesPanel, updateNodeProperties, openServiceModal, closeServiceModal, addSubServiceNode, openPropertiesPanel } = useAwsBuilder();
  const [propertyValues, setPropertyValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listeners, setListeners] = useState<{ protocol: string; port: number; target: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'ai' | 'subservices'>('properties');
  const [panelExpanded, setPanelExpanded] = useState<boolean>(true);

  // console.log(propertyValues, "propertyValues")
  const service = state.selectedService;
  const subService = state.selectedSubService;
  const editingNode = state.selectedNodeId
    ? state.placedNodes.find(n => n.id === state.selectedNodeId)
    : null;
  const theme = getProviderTheme(currentProvider);
  const subServicesList = useMemo(() => {
    const svc = service as any;
    return Array.isArray(svc?.subServices) ? svc.subServices : [];
  }, [service]);

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
    if (!editingNode) return null;

    // EC2 Instance
    const isEc2Instance = editingNode.subServiceId === 'ec2-instance' || (editingNode as any).icon?.id === 'ec2-instance';
    if (isEc2Instance) {
      const ami = (editingNode as any)?.properties?.ami || '';
      const instanceType = (editingNode as any)?.properties?.instanceType || '';
      const keyName = (editingNode as any)?.properties?.keyPair || '';

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

      // Parent node, if selected
      const parentNode = editingNode && !editingNode.isSubService ? editingNode : null;

      if (editingNode && !subService) {
        // Editing a parent service (e.g., EC2): update common properties; name change will propagate
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
        // If editing an existing sub-service node, update it
        if (editingNode && editingNode.isSubService) {
          const toSave: Record<string, any> = {};
          subPropIds.forEach(id => {
            toSave[id] = propertyValues[id];
          });
          updateNodeProperties(editingNode.id, toSave);
          closePropertiesPanel();
          // Auto-close service modal after any save operation
          closeServiceModal();
          return;
        }

        // Otherwise, we are adding/updating a sub-service under the selected parent
        const hostParent = parentNode || (state.selectedNodeId ? state.placedNodes.find(n => n.id === state.selectedNodeId && !n.isSubService) || null : null);

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
    const isReadOnlyInstanceName = isPrimaryName && !!subService;

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

  // Panel is now persistent; always render with default content when no selection

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
              <button
                onClick={closePropertiesPanel}
                className="text-slate-700 hover:text-slate-900 text-xl font-bold w-6 h-6 flex items-center justify-center flex-shrink-0 ml-2"
              >
                ×
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
                <div
                  className="text-center py-8"
                  style={{ color: theme.textSecondary }}
                >
                  <p>Select a service to configure its properties</p>
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
                    {subServicesList.map((sub: any, idx: number) => (
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