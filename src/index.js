const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are a highly skilled environment variable generator. Your task is to create a set of environment variables suitable for dynamic deployments based on provided context. You will be given a {context_type} (e.g., branch name, commit message, issue title) and its corresponding {context_value}. Your goal is to generate a list of environment variables that can be used to configure a deployment environment dynamically.

Consider the following:

*   **Environment Naming:** Create a meaningful environment name based on the {context_value}. This should be safe for use in environment variable names (e.g., lowercase, alphanumeric, underscores).
*   **Deployment Stage:** Determine the appropriate deployment stage (e.g., 'development', 'staging', 'production') based on the {context_value}. If the {context_value} indicates a feature branch or a pull request, default to 'development'. If it indicates a release branch or a tag, consider 'staging'. If it's the main branch (e.g., 'main', 'master'), consider 'production'.
*   **Versioning:** Extract or generate a version number from the {context_value}. This could be a branch name, a commit hash (shortened), or a semantic version.
*   **Feature Flags:** Based on the {context_value}, consider setting feature flags. For example, if the {context_value} is a feature branch, enable the associated feature flag.
*   **Security:** Do NOT generate any sensitive information directly. Focus on environment configuration, not secrets management.

Your output should be a list of environment variables in the following format:

ENVIRONMENT_NAME={generated_environment_name}
DEPLOYMENT_STAGE={determined_deployment_stage}
VERSION={extracted_version}
FEATURE_FLAG_FEATURE_X={feature_flag_value} (Optional, based on context)

Here's the {context_type}: {context_value}

Generate the environment variables:`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/dynamic-environment-variable-generator', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
