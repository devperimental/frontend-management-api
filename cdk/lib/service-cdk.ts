import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Duration } from 'aws-cdk-lib';

export interface IStackSettings extends cdk.StackProps
{
  action:string;
  accountId:string;
  service_key:string;
  ecr_repository_name:string;
  target_environment:string;
}

export class AwsCdkDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IStackSettings) {
    super(scope, id, props);

    // Create a VPC for the ECS Fargate containers
    const vpc = new ec2.Vpc(this, "workshop-vpc", {
      cidr: "10.1.0.0/16",
      natGateways: 1,
      subnetConfiguration: [
        {  cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, name: "Public" },
        {  cidrMask: 24, subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, name: "Private" }
        ],
      maxAzs: 1 // Default is all AZs in region
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    // Execution Role Policy for the Task Definition
    const executionRolePolicy =  new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ]
    });
    
    // Create a Fargate Task Definition
    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // Attache executionRole Policy
    fargateTaskDefinition.addToExecutionRolePolicy(executionRolePolicy);

    // Get the Repository for the required service
    const repository = ecr.Repository.fromRepositoryName(this, "repo", props.ecr_repository_name)
    
    // Add container to the fargate task definition
    const container = fargateTaskDefinition.addContainer("backend", {
      // Use an image from Amazon ECR
      image: ecs.ContainerImage.fromEcrRepository(repository, props.target_environment),
      // Setup cloudwatch logs
      logging: ecs.LogDrivers.awsLogs({streamPrefix: props.service_key}), // 'frontend-management-api'
      // Pass environment variables
      environment: { 
        'environmentName': 'local'
      }
    });
    
    // Add container port mappings
    container.addPortMappings({
      containerPort: 80
    });

    // Create a security group for a Fargate Service
    const sg_service = new ec2.SecurityGroup(this, 'MySGService', { vpc: vpc });

    // Add an ingress rule
    sg_service.addIngressRule(ec2.Peer.ipv4('0.0.0.0/0'), ec2.Port.tcp(80));
    
    // Create a Fargate Service
    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition: fargateTaskDefinition,
      desiredCount: 2,
      assignPublicIp: false,
      securityGroups: [sg_service]
    });
    
    // Setup AutoScaling policy for the Fargate Service
    const scaling = service.autoScaleTaskCount({ maxCapacity: 6, minCapacity: 2 });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    });

    // Create Load Balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true
    });

    // Add Listener to the Load Balancer
    const listener = lb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [service],
      healthCheck: { path: '/healthz' }
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

  }
}
