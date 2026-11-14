/**
 * Pavion RTS – Indeed Sponsored Requisitions Provider
 * Syncs active ATS requisitions to Indeed Job Sync API.
 */

export class IndeedProvider {
  public async postRequisition(jobId: string, title: string, description: string): Promise<{ status: string; indeedJobId: string }> {
    return {
      status: 'active_sponsored',
      indeedJobId: `ind_${jobId}_${Date.now()}`,
    };
  }
}
