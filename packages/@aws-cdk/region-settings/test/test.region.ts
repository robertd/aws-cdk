import nodeunit = require('nodeunit');
import { Region } from '../lib';

export = nodeunit.testCase({
  'Old, standard partition region'(test: nodeunit.Test) {
    // GIVEN
    const regionName = 'us-east-1';

    // WHEN
    const region = Region.named(regionName);

    // THEN
    test.equals(region.name, regionName);
    test.equals(region.partition, 'aws');

    test.equals(region.apiGateway.hostedZoneIds && region.apiGateway.hostedZoneIds.edgeOptimized, 'Z2FDTNDATAQYW2');
    test.equals(region.apiGateway.hostedZoneIds && region.apiGateway.hostedZoneIds.regional, 'Z1UJRXOUMOOFQ8');

    test.equals(region.s3StaticWebsite.legacyNameFormat, true);
    test.equals(region.s3StaticWebsite.hostedZoneId, 'Z3AQBSTGFYJSTF');

    test.equals(region.servicePrincipal('sqs'), 'sqs.amazonaws.com');
    test.equals(region.servicePrincipal('states'), `states.${regionName}.amazonaws.com`);
    test.equals(region.servicePrincipal('lambda'), 'lambda.amazonaws.com');
    test.equals(region.servicePrincipal('logs'), `logs.${regionName}.amazonaws.com`);

    test.done();
  },

  'New, standard partition region'(test: nodeunit.Test) {
    // GIVEN
    const regionName = 'eu-west-3';

    // WHEN
    const region = Region.named(regionName);

    // THEN
    test.equals(region.name, regionName);
    test.equals(region.partition, 'aws');

    test.equals(region.apiGateway.hostedZoneIds && region.apiGateway.hostedZoneIds.edgeOptimized, 'Z2FDTNDATAQYW2');
    test.equals(region.apiGateway.hostedZoneIds && region.apiGateway.hostedZoneIds.regional, 'Z3KY65QIEKYHQQ');

    test.equals(region.s3StaticWebsite.legacyNameFormat, false);
    test.equals(region.s3StaticWebsite.hostedZoneId, 'Z3R1K369G5AVDG');

    test.equals(region.servicePrincipal('sqs'), 'sqs.amazonaws.com');
    test.equals(region.servicePrincipal('states'), `states.${regionName}.amazonaws.com`);
    test.equals(region.servicePrincipal('lambda'), 'lambda.amazonaws.com');
    test.equals(region.servicePrincipal('logs'), `logs.${regionName}.amazonaws.com`);

    test.done();
  },

  'China partition region'(test: nodeunit.Test) {
    // GIVEN
    const regionName = 'cn-north-1';

    // WHEN
    const region = Region.named(regionName);

    // THEN
    test.equals(region.name, regionName);
    test.equals(region.partition, 'aws-cn');

    test.equals(region.apiGateway.hostedZoneIds, undefined);

    test.equals(region.s3StaticWebsite.legacyNameFormat, false);
    test.equals(region.s3StaticWebsite.hostedZoneId, undefined);

    test.equals(region.servicePrincipal('sqs'), 'sqs.amazonaws.com');
    test.equals(region.servicePrincipal('states'), `states.${regionName}.amazonaws.com`);
    test.equals(region.servicePrincipal('lambda'), 'lambda.amazonaws.com.cn');
    test.equals(region.servicePrincipal('logs'), `logs.${regionName}.amazonaws.com.cn`);

    test.done();
  },

  'New (unconfigured) region'(test: nodeunit.Test) {
    // GIVEN
    const regionName = 'bermuda-triangle-1';

    // WHEN
    const region = Region.named(regionName);

    // THEN
    test.equals(region.name, regionName);
    test.equals(region.partition, 'aws');

    test.equals(region.apiGateway.hostedZoneIds && region.apiGateway.hostedZoneIds.edgeOptimized, 'Z2FDTNDATAQYW2');
    test.equals(region.apiGateway.hostedZoneIds && region.apiGateway.hostedZoneIds.regional, undefined);

    test.equals(region.s3StaticWebsite.legacyNameFormat, false);
    test.equals(region.s3StaticWebsite.hostedZoneId, undefined);

    test.equals(region.servicePrincipal('sqs'), 'sqs.amazonaws.com');
    test.equals(region.servicePrincipal('states'), `states.${regionName}.amazonaws.com`);
    test.equals(region.servicePrincipal('lambda'), 'lambda.amazonaws.com');
    test.equals(region.servicePrincipal('logs'), `logs.${regionName}.amazonaws.com`);

    test.done();
  },
});
