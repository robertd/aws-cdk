import fs = require('fs');
import path = require('path');
import { DefaultServicePrincipalMaker, IServicePrincipalMaker } from './service-principal';

const REGIONS: { [name: string]: Region } = {};

/**
 * Information about a specific AWS region.
 *
 * Settings for a particular region can be obtained using `Region.named`.
 * Settings can be registered or overridden using `Region.register`.
 */
export class Region {
  /**
   * Register a new region's settings. Use this to inject your own region settings.
   *
   * @param region    the new region settings to be registered.
   * @param overwrite whether existing settings for the region should be overwritten.
   */
  public static register(region: Region, overwrite = true): void {
    if (region.name in REGIONS) {
      if (overwrite) {
        process.stderr.write(`WARNING: overwriting existing region settings for ${region.name}\n`);
      } else {
        throw new Error(`Attempted to overwrite region settings for ${region.name}`);
      }
    }
    REGIONS[region.name] = region;
  }

  /**
   * Retrieve settings for a particular region name.
   *
   * @param region the name of the region being looked up.
   */
  public static named(region: string): Region {
    return REGIONS[region] || new Region(region, {});
  }

  /** The partition of the AWS region (e.g: aws-cn) */
  public readonly partition: string;

  /** The domain name suffix for the partition */
  public readonly domainSuffix: string;

  /** Information about API Gateway's settings in the region */
  public readonly apiGateway: ApiGatewaySettings;

  /** Information about the behavior of S3 Website hosting in the region */
  public readonly s3StaticWebsite: S3StaticWebsiteSettings;

  /** Whether the AWS::CDK::Metadata CloudFormation resource is available */
  public readonly hasCdkMetadataResource: boolean;

  private readonly servicePrincipalMaker: IServicePrincipalMaker;

  /**
   * Initializes new Region settings, so they can be passed to `Region.register`.
   *
   * @param name The name of the AWS region (e.g: us-east-1)
   */
  public constructor(public readonly name: string, props: RegionProps) {
    this.partition = props.partition || 'aws';
    this.domainSuffix = props.domainSuffix || 'amazonaws.com';
    this.hasCdkMetadataResource = props.hasCdkMetadataResource !== false;

    const edgeHostedZoneId = props.apiGatewayEdgeOptimizedHostedZoneId == null
      ? 'Z2FDTNDATAQYW2'
      : props.apiGatewayEdgeOptimizedHostedZoneId;
    this.apiGateway = {
      hostedZoneIds: edgeHostedZoneId || props.apiGatewayRegionalHostedZoneId
        ? { edgeOptimized: edgeHostedZoneId, regional: props.apiGatewayRegionalHostedZoneId }
        : undefined,
    };

    this.s3StaticWebsite = {
      legacyNameFormat: !!props.s3StaticWebsiteLegacyNameFormat,
      hostedZoneId: props.s3StaticWebsiteHostedZoneId,
    };

    this.servicePrincipalMaker = props.servicePrincipalMaker || DefaultServicePrincipalMaker.instance;
  }

  /**
   * Computes the appropriate service principal for a given service short name.
   *
   * @param service the name of the service for which a principal is requested. For example `sns`, `s3`, ...
   *
   * @returns a service principal name, such as `s3.amazonaws.com`.
   */
  public servicePrincipal(service: string): string {
    return this.servicePrincipalMaker.makeServicePrincipal(service, this);
  }
}

export interface RegionProps {
  /**
   * The partition in which a region is (e.g: `aws`, `aws-cn`, ...)
   *
   * @default aws
   */
  partition?: string;

  /**
   * The domain suffix for the partition
   * @default amazonaws.com
   */
  domainSuffix?: string;

  /**
   * Whether the AWS::CDK::Metadata CloudFormation resource is available.
   *
   * @default true
   */
  hasCdkMetadataResource?: boolean;

  /**
   * Hosted zone ID for the edge-optimized endpoint
   * @default Z2FDTNDATAQYW2
   */
  apiGatewayEdgeOptimizedHostedZoneId?: string;

  /**
   * Hosted zone ID for the regional endpoint
   * @default none
   */
  apiGatewayRegionalHostedZoneId?: string;

  /**
   * Whether the legacy `s3-website-${region}.${domain}` endpoint format is used in that region.
   * @default false
   */
  s3StaticWebsiteLegacyNameFormat?: boolean;

  /**
   * The Hosted Zone ID for S3 static websites in the region.
   * @default none
   */
  s3StaticWebsiteHostedZoneId?: string;

  /**
   * The service principal maker for the region.
   * @default DefaultServicePrincipalMaker
   */
  servicePrincipalMaker?: IServicePrincipalMaker;
}

// Loading all the built-in configurations.
for (const name of fs.readdirSync(path.join(__dirname, 'settings'))) {
  if (!name.endsWith('.js')) { continue; }
  const moduleName = `./settings/${name}`;
  // tslint:disable-next-line:no-var-requires
  const module = require(moduleName);
  let foundRegion = false;
  for (const exportedValue of Object.values(module)) {
    if (exportedValue instanceof Region) {
      // Don't allow overwrites - the built-in settings should only ever define a region once.
      Region.register(exportedValue, false);
      foundRegion = true;
    }
  }
  if (!foundRegion) {
    throw new Error(`The module '${moduleName}' does not export any Region instances!`);
  }
}

export interface ApiGatewaySettings {
  /** Hosted zone IDs for API Gateway endpoints, if Route53 is supported in the region */
  readonly hostedZoneIds?: ApiGatewayHostedZoneIds;
}

export interface ApiGatewayHostedZoneIds {
  /** The hosted zone ID for edge-optimized endpoints */
  readonly edgeOptimized: string;

  /** The hosted zone ID for regional endpoints, if available */
  readonly regional?: string;
}

export interface S3StaticWebsiteSettings {
  /** Whether the legacy `s3-website-${region}.${domain}` endpoint format is used in that region. */
  legacyNameFormat: boolean;

  /** The Hosted Zone ID for S3 static websites, if Route53 is supported in the region */
  hostedZoneId?: string;
}
