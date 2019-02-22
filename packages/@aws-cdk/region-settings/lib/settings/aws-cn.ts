import { Region, RegionProps } from '../region';

const props: RegionProps = {
  partition: 'aws-cn',
  domainSuffix: 'amazonaws.com.cn',
  apiGatewayEdgeOptimizedHostedZoneId: '',
};

// tslint:disable:variable-name Just replacing - with _ in region names...
export const cn_northwest_1 = new Region('cn-northwest-1', props);
export const cn_north_1 = new Region('cn-north-1', props);
