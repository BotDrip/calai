import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const questions = [
  { key: 'VITE_FIREBASE_API_KEY', label: 'Firebase API Key' },
  { key: 'VITE_FIREBASE_AUTH_DOMAIN', label: 'Firebase Auth Domain' },
  { key: 'VITE_FIREBASE_PROJECT_ID', label: 'Firebase Project ID' },
  { key: 'VITE_FIREBASE_STORAGE_BUCKET', label: 'Firebase Storage Bucket' },
  { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', label: 'Firebase Messaging Sender ID' },
  { key: 'VITE_FIREBASE_APP_ID', label: 'Firebase App ID' },
]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ask = (prompt) =>
  new Promise((resolve) => {
    rl.question(`${prompt}: `, (answer) => resolve(answer.trim()))
  })

const run = async () => {
  const lines = []
  for (const question of questions) {
    const answer = await ask(question.label)
    lines.push(`${question.key}=${answer}`)
  }

  const envPath = path.resolve(process.cwd(), '.env')
  fs.writeFileSync(envPath, `${lines.join('\n')}\n`, 'utf8')
  rl.close()
  console.log(`Saved ${envPath}`)
}

run().catch((error) => {
  console.error(error)
  rl.close()
  process.exit(1)
})
