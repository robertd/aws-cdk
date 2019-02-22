import { Region } from "./region";

/**
 * An entity that is capable of computing service principals (e.g: sqs.amazonaws.com).
 */
export interface IServicePrincipalMaker {
  /**
   * Coputes the appropriate service principal for a given service in a given region.
   * @param service the short name of the service for which a principal is needed (e.g: `sqs`)
   * @param region  the region in where the service principal resides
   * @returns a service principal string (e.g: `sqs.amazonaws.com`)
   */
  makeServicePrincipal(service: string, region: Region): string;
}

/**
 * A service principal maker that knows to generate valid principals for the built-in AWS region settings.
 */
export class DefaultServicePrincipalMaker implements IServicePrincipalMaker {
  public static instance: IServicePrincipalMaker = new DefaultServicePrincipalMaker();

  private constructor() { }

  public makeServicePrincipal(service: string, region: Region): string {
    switch (service) {
      // Services with a regional AND partitional principal
      case 'codedeploy':
      case 'logs':
        return `${service}.${region.name}.${region.domainSuffix}`;

      // Services with a partitional principal
      case 'application-autoscaling':
      case 'autoscaling':
      case 'ec2':
      case 'events':
      case 'lambda':
        return `${service}.${region.domainSuffix}`;

      // Services with a regional principal
      case 'states':
        return `${service}.${region.name}.amazonaws.com`;

      // Services with a universal principal across all regions / partitions.
      case 'sqs':
      case 'sns':
      default:
        return `${service}.amazonaws.com`;
    }
  }
}
