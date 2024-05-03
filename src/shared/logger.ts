export default class Logger {
  name: string = "mizuki";
  constructor(name: string) {
    this.name = name;
  }
  logs: string[] = [];

  log(message: string) {
    const msg = `[+] [INFO] [${this.name}]: ${message}`;
    this.logs.push(msg);
    console.log(msg);
  }
  warn(message: string) {
    const msg = `[!] [WARN] [${this.name}]: ${message}`;
    this.logs.push(msg);
    console.warn(msg);
  }
  error(message: string) {
    const msg = `[-] [ERR] [${this.name}]: ${message}`;
    this.logs.push(msg);
    console.warn(msg);
  }
}
