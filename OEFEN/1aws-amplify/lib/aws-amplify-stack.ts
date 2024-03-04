/* eslint-disable max-lines */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as iam from 'aws-cdk-lib/aws-iam';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { IAwsAmplifyStackProps } from '../bin/types';
import { NagSuppressions } from 'cdk-nag';

export class AwsAmplifyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IAwsAmplifyStackProps) {
    super(scope, id, props);

    /*--------------get----------------- */

    // Get github token from secret manager
    const secret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'githubSecret',
      props.secretName
    );

    /*---------------iam---------------- */

    // 1. create new IAM role
    const role = new iam.Role(this, 'Role', {
      roleName: props.roleName,
      description: props.roleDesc,
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
    });

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify')
    );

    secret.grantRead(role);

    /*-------------------------------------- */

    // 3. buildspecs for next.js static website
    const buildSpec = codebuild.BuildSpec.fromObjectToYaml({
      version: '1.0',
      frontend: {
        phases: {
          preBuild: { commands: ['npm ci'] },
          build: { commands: ['npm run build'] },
        },
        artifacts: {
          baseDirectory: '.next',
          files: ['**/*'],
        },
        cache: { paths: ['node_modules/**/*'] },
      },
    });

    // 4. amplify app from github repository
    const amplifyApp = new amplify.App(this, 'PrintHelix', {
      appName: props.appName,
      description: props.appDesc,
      role,
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: props.gitOwner,
        repository: props.gitRepo,
        oauthToken: secret.secretValueFromJson('secret'),
      }),
      autoBranchCreation: {
        autoBuild: true,
        patterns: [props.gitBranch],
      },
      autoBranchDeletion: true,
      buildSpec,
    });

    // 5. add main branch
    const main = amplifyApp.addBranch('Main', {
      autoBuild: true,
      branchName: props.gitBranch,
      stage: 'PRODUCTION',
    });

    const domain = amplifyApp.addDomain(props.appName);
    domain.mapRoot(main);
    domain.mapSubDomain(main, 'www');

    // set platform
    const setPlatform = new AwsCustomResource(this, 'AmplifySetPlatform', {
      onUpdate: {
        service: 'Amplify',
        action: 'updateApp',
        parameters: {
          appId: amplifyApp.appId,
          platform: 'WEB_COMPUTE',
        },
        physicalResourceId: PhysicalResourceId.of(
          'AmplifyCustomResourceSetPlatform'
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [amplifyApp.arn],
      }),
    });
    setPlatform.node.addDependency(domain);

    // set framework
    const setFramework = new AwsCustomResource(this, 'AmplifySetFramework', {
      onUpdate: {
        service: 'Amplify',
        action: 'updateBranch',
        parameters: {
          appId: amplifyApp.appId,
          branchName: 'main',
          framework: 'Next.js - SSR',
        },
        physicalResourceId: PhysicalResourceId.of(
          'AmplifyCustomResourceSetPlatform'
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE, // This allows actions on any resource
      }),
    });
    setFramework.node.addDependency(domain);

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-IAM4', reason: 'Using Amplify AWS Managed Policy.' },
      { id: 'AwsSolutions-IAM5', reason: 'Wildcard in AWS Managed Policy.' },
      {
        id: 'CdkNagValidationFailure',
        reason: 'Custom resource uses other node version.',
      },
      {
        id: 'AwsSolutions-L1',
        reason: 'Custom resource uses other node version.',
      },
    ]);
  }
}

/*

What will hapen? 

We have created a stack for amplify. Once we deploy this it will create a Amplify application in our AWS account. It will pull the Next app (Next 13 with SSR) from Github. And it will build and deploy it. And will also attach our custum domain to it. You do have to have a custum domain in Route 53 to let this work. 

*/

/*

1. create iam role 

const role = new iam.Role(this, 'Role', {
  roleName:     props.roleName, 
  description:  props.roleDesc, 
  assumedBy:    new iam.ServicePrincipal('amplify.amazonaws.com')
})

role.addManagedPolicy(    iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify')     )

*/

/*

2.  import Github token

const secret = secretsmanager.Secret.fromSecretNameV2(this, 'githubSecret', props.secretName)
secret.grandRead(role)    // secret can be read by the above created role

// the role needs to read the token to access Github. When we pull the frontend from Github we need to build it. 

*/

/*

3.  build the frontend nextjs 13 with SSR (not static)

//////

*/

/*

4.  Add amplify stack itself 

/////////

*/

/*
5.  Add main branche 



*/

/*

What will hapen? 

We have created a stack for amplify. Once we deploy this it will create a Amplify application in our AWS account. It will pull the Next app (Next 13 with SSR) from Github. And it will build and deploy it. And will also attach our custum domain to it. You do have to have a custum domain in Route 53 to let this work. 

*/
