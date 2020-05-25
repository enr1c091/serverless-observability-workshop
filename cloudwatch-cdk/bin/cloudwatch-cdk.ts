#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CloudwatchCdkStack } from '../lib/cloudwatch-cdk-stack';

const app = new cdk.App();
new CloudwatchCdkStack(app, 'CloudwatchCdkStack');
