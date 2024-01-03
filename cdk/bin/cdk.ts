#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CartStack } from '../lib/cart-stack';

const app = new App();
new CartStack(app, 'CartStack', {});
