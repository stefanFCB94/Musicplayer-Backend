export interface IServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;

  getHttpPort(): Promise<number>;
  getHttpsPort(): Promise<number>;
  getUseHttps(): Promise<boolean>;
  getUseGraphiQl(): Promise<boolean>;
  getGraphQlEndpoint(): Promise<string>;
  getGraphiQlEndpoint(): Promise<string>;
  getRestEndpoint(): Promise<string>;
  getCertificatePath(): Promise<string>;
  getPrivateKeyPath(): Promise<string>;

  setUseHttps(useHTTPS: boolean): Promise<void>;
  setUseGraphiQl(useGraphiQl: boolean): Promise<void>;
  setHttpPort(port: number): Promise<void>;
  setHttpsPort(port: number): Promise<void>;
  setGraphQlEndpoint(endpoint: string): Promise<void>;
  setGraphiQlEndpoint(endpoint: string): Promise<void>;
  setRestEndpoint(endpoint: string): Promise<void>;
  setCertificatePath(path: string): Promise<void>;
  setPrivateKeyPath(path: string): Promise<void>;
}
