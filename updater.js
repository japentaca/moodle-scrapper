console.log("updater start")
import { execFile } from 'node:child_process';
const child_git = execFile('git ', ['pull'], (error, stdout, stderr) => {
  console.log("stderr lanzar git", stderr);
  if (error) {
    console.log("error lanzando git", error)
  }
  console.log("output de git pull", stdout);
  const child_start = execFile('node', ['./index.js'], (error, stdout, stderr) => {
    console.log("stderr lanzar node index", stderr);
    if (error) {
      console.log("error lanzando node index", error)
    }
    console.log("output de lanzar node index", stdout)


  });
});

setTimeout(() => {
  console.log("updater end")
  process.exit(0)
}, 1000)