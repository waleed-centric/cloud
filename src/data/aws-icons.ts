export interface AwsIcon {
  id: string;
  name: string;
  category: string;
  image: string; // Changed from svg to image
  width: number;
  height: number;
}

export const AWS_ICONS: AwsIcon[] = [
  // Compute Services
  {
    id: "ec2",
    name: "EC2",
    category: "Compute",
    image: "/images/Compute/ec2_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "lambda",
    name: "Lambda",
    category: "Compute",
    image: "/images/Compute/lamdaIcon.png",
    width: 50,
    height: 50,
  },
  {
    id: "ecs",
    name: "ECS",
    category: "Compute",
    image: "/images/Compute/ECSIcon.png",
    width: 50,
    height: 50,
  },
  {
    id: "eks",
    name: "EKS",
    category: "Compute",
    image: "/images/Compute/EKS.png",
    width: 50,
    height: 50,
  },
  {
    id: "batch",
    name: "Batch",
    category: "Compute",
    image: "/images/Compute/BatchIcon.png",
    width: 50,
    height: 50,
  },

  // Storage Services
  {
    id: "s3",
    name: "S3",
    category: "Storage",
    image: "/images/Storage/S3_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "ebs",
    name: "EBS",
    category: "Storage",
    image: "/images/Storage/EBS_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "efs",
    name: "EFS",
    category: "Storage",
    image: "/images/Storage/EFS_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "fsx",
    name: "FSx",
    category: "Storage",
    image: "/images/Storage/FSx_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "glacier",
    name: "Glacier",
    category: "Storage",
    image: "/images/Storage/Glacier_Icon.png",
    width: 50,
    height: 50,
  },

  // Database Services
  {
    id: "rds",
    name: "RDS",
    category: "Database",
    image: "/images/Database/RDS_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "Database",
    image: "/images/Database/DynamoDB_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "Database",
    image: "/images/Database/Aurora_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "documentdb",
    name: "DocumentDB",
    category: "Database",
    image: "/images/Database/DocumentDB_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "elasticsearch",
    name: "ElasticSearch",
    category: "Database",
    image: "/images/Database/ElasticSearch_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "redshift",
    name: "Redshift",
    category: "Database",
    image: "/images/Database/Redshift_Icon.png",
    width: 50,
    height: 50,
  },

  // Networking Services
  {
    id: "vpc",
    name: "VPC",
    category: "Networking",
    image: "/images/Networking/VPC_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "cloudfront",
    name: "CloudFront",
    category: "Networking",
    image: "/images/Networking/CloudFront_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "apigateway",
    name: "API Gateway",
    category: "Networking",
    image: "/images/Networking/Api_Gateway_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "elb",
    name: "Load Balancer",
    category: "Networking",
    image: "/images/Networking/LoadBalancer_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "route53",
    name: "Route 53",
    category: "Networking",
    image: "/images/Networking/Route53_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "directconnect",
    name: "Direct Connect",
    category: "Networking",
    image: "/images/Networking/DirectConnect_Icon.png",
    width: 50,
    height: 50,
  },

  // Security Services
  {
    id: "iam",
    name: "IAM",
    category: "Security",
    image: "/images/Security/IAM_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "cognito",
    name: "Cognito",
    category: "Security",
    image: "/images/Security/Cognito_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "waf",
    name: "WAF",
    category: "Security",
    image: "/images/Security/WAF_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "secretsmanager",
    name: "Secrets Manager",
    category: "Security",
    image: "/images/Security/SecretManager_Icon.png",
    width: 50,
    height: 50,
  },

  // Monitoring Services
  {
    id: "cloudwatch",
    name: "CloudWatch",
    category: "Monitoring",
    image: "/images/Monitoring/CloudWatch_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "cloudtrail",
    name: "CloudTrail",
    category: "Monitoring",
    image: "/images/Monitoring/CloudTrail_Icon.png",
    width: 50,
    height: 50,
  },
  {
    id: "xray",
    name: "X-Ray",
    category: "Monitoring",
    image: "/images/Monitoring/X-ray_Icon.png",
    width: 50,
    height: 50,
  },
];