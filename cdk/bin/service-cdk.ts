#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkDemoStack, IStackSettings } from '../lib/service-cdk';

const action:string = process.env.cdk_action || 'unknown';
const accountId:string = process.env.aws_account_id || 'unknown';
const service_key:string = process.env.service_key || 'unknown';
const ecr_repository_name:string = process.env.ecr_repository_name || 'unknown';
const target_environment:string = process.env.target_environment || 'unknown';

const stackSettings: IStackSettings = {
  action: action,
  accountId: accountId,
  service_key: service_key,
  ecr_repository_name: ecr_repository_name,
  target_environment: target_environment
}

console.log(stackSettings);

const app = new cdk.App();

new AwsCdkDemoStack(app, 'AwsCdkDemoStack', stackSettings);
