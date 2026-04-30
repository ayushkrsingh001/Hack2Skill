/**
 * Guidance Service — Personalized election guidance based on user profile.
 * Provides smart, decision-based responses tailored to user context.
 * @module services/guidance
 */

const { getCache, setCache } = require('../utils/cache');

/**
 * Generate personalized guidance based on user profile.
 * @param {object} profile - User profile data.
 * @param {number} [profile.age] - User's age.
 * @param {string} [profile.state] - User's state.
 * @param {boolean} [profile.firstTimeVoter] - Is first-time voter.
 * @param {boolean} [profile.registered] - Already registered.
 * @returns {object} Personalized guidance with eligibility, steps, and tips.
 */
function getPersonalizedGuidance(profile = {}) {
  const cacheKey = `guidance:${JSON.stringify(profile)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { age, state, firstTimeVoter, registered } = profile;
  const guidance = {
    eligible: true,
    message: '',
    steps: [],
    tips: [],
    urgentActions: []
  };

  // Age-based eligibility
  if (age && age < 18) {
    guidance.eligible = false;
    guidance.message = `You are ${age} years old. You need to be 18+ to vote, but you can pre-register now!`;
    guidance.steps = [
      'Visit voters.eci.gov.in',
      'Fill Form 6 for advance registration',
      'Your registration activates when you turn 18'
    ];
    guidance.tips = [
      'Start learning about the election process now',
      'Gather your documents (Aadhaar, birth certificate) in advance'
    ];
    setCache(cacheKey, guidance, 86400); // 24h cache
    return guidance;
  }

  guidance.eligible = true;
  guidance.message = age
    ? `You are ${age} years old and eligible to vote!`
    : 'Based on your profile, here is your personalized voting guide.';

  // Registration status
  if (registered === false || registered === 'no') {
    guidance.urgentActions.push('Register to vote immediately at voters.eci.gov.in');
    guidance.steps = [
      'Visit voters.eci.gov.in and click "New Voter Registration"',
      'Fill Form 6 with your personal details',
      'Upload: passport photo, age proof, address proof',
      'Submit and save your reference number',
      'Wait for BLO verification (2-4 weeks)',
      'Receive your Voter ID (EPIC) card'
    ];
  } else {
    guidance.steps = [
      'Check your details on the electoral roll at voters.eci.gov.in',
      'Verify your polling booth location',
      'Keep your Voter ID / approved photo ID ready',
      'Vote on election day (7 AM - 6 PM)'
    ];
  }

  // First-time voter tips
  if (firstTimeVoter === true || firstTimeVoter === 'yes') {
    guidance.tips.push(
      '🎉 Congratulations on your first vote! Every vote matters.',
      'Reach your booth early to avoid long queues',
      'Carry your Voter ID (EPIC) — it\'s the preferred ID',
      'The EVM has a blue button for each candidate — press once',
      'After pressing, check the VVPAT slip (visible for 7 seconds)',
      'Don\'t share photos of your vote — it\'s illegal'
    );
  } else {
    guidance.tips.push(
      'Verify your details haven\'t changed since last election',
      'Check if your polling booth location has changed',
      'Polling hours: 7 AM to 6 PM'
    );
  }

  // State-specific tips
  if (state) {
    guidance.tips.push(
      `Check ${state}-specific election dates on eci.gov.in`,
      `Your state election commission may have additional guidelines`
    );
  }

  setCache(cacheKey, guidance, 86400); // 24h cache
  return guidance;
}

module.exports = { getPersonalizedGuidance };
