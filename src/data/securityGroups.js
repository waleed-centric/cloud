// Initial static Security Groups data
// Future: replace with API calls to load/save from backend

export const initialSecurityGroups = [
  {
    id: 'sg-001',
    name: 'web-sg',
    description: 'Allow HTTP/HTTPS from internet; SSH from admin subnet',
    vpcId: 'vpc-12345',
    ingress: [
      { protocol: 'tcp', fromPort: 80, toPort: 80, cidr: '0.0.0.0/0', description: 'HTTP' },
      // Removed extra defaults: keep only one ingress rule by default
    ],
    egress: [
      { protocol: '-1', fromPort: 0, toPort: 0, cidr: '0.0.0.0/0', description: 'All outbound' },
    ],
  },
  {
    id: 'sg-002',
    name: 'db-sg',
    description: 'Allow MySQL from app subnet only',
    vpcId: 'vpc-12345',
    ingress: [
      { protocol: 'tcp', fromPort: 3306, toPort: 3306, cidr: '10.0.2.0/24', description: 'MySQL from app' },
    ],
    egress: [
      { protocol: '-1', fromPort: 0, toPort: 0, cidr: '0.0.0.0/0', description: 'All outbound' },
    ],
  },
  {
    id: 'sg-003',
    name: 'elb-sg',
    description: 'Public Load Balancer inbound only',
    vpcId: 'vpc-12345',
    ingress: [
      { protocol: 'tcp', fromPort: 80, toPort: 80, cidr: '0.0.0.0/0', description: 'HTTP' },
      // Removed extra defaults: keep only one ingress rule by default
    ],
    egress: [
      { protocol: '-1', fromPort: 0, toPort: 0, cidr: '0.0.0.0/0', description: 'All outbound' },
    ],
  },
];

// Suggested shape for backend integration
// export async function fetchSecurityGroups() { /* GET /api/security-groups */ }
// export async function createSecurityGroup(group) { /* POST /api/security-groups */ }
// export async function updateSecurityGroup(id, patch) { /* PUT /api/security-groups/:id */ }
// export async function deleteSecurityGroup(id) { /* DELETE /api/security-groups/:id */ }