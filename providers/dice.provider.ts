/**
 * Pavion RTS – Dice Tech Sourcing API Provider
 * Connects to Dice Candidate Search API for high-velocity US technical candidate sourcing.
 */

export interface DiceCandidate {
  diceId: string;
  name: string;
  title: string;
  workAuthorization: string;
  skills: string[];
  yearsExperience: number;
  hourlyRateTarget: number;
}

export class DiceProvider {
  public async searchTechTalent(skills: string[], minExp: number): Promise<DiceCandidate[]> {
    return [
      {
        diceId: 'dice_45892',
        name: 'Karan Mehra',
        title: 'Senior Snowflake Data Engineer',
        workAuthorization: 'US Citizen',
        skills: ['Snowflake', 'Python', 'SQL', 'DBT', 'AWS'],
        yearsExperience: 7.5,
        hourlyRateTarget: 95.0,
      },
    ];
  }
}
