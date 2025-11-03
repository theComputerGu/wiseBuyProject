type SignUpInput = { name: string; email: string; password: string };

export async function signIn(email: string, password: string, _remember: boolean) {
  await sleep(500);
  return !!email && !!password; // TODO: להחליף ב-fetch לשרת
}
export async function signUp(input: SignUpInput, _remember: boolean) {
  await sleep(700);
  return !!input.email && !!input.password; // TODO: להחליף ב-fetch אמיתי
}
const sleep = (ms:number)=> new Promise(r=>setTimeout(r, ms));
