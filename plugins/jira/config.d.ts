export interface Config {
  /**
   * Jira configuration
   */
  jira?: {
    /**
     * The base URL of your Jira instance
     * @visibility frontend
     */
    baseUrl: string;
    
    /**
     * Your Jira email address
     * @visibility secret
     */
    email: string;
    
    /**
     * Your Jira API token
     * @visibility secret
     */
    apiToken: string;
  };
}
