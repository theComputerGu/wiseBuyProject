import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Logo from "../components/Logo";

// ✅ RTK Query + Redux
import { useCreateUserMutation } from "../app/src/svc/wisebuyApi";
import { useDispatch } from "react-redux";
import { setUser/*, setToken*/ } from "../app/src/slices/authSlice";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirm: z.string().min(6),
}).refine(v => v.password === v.confirm, { path:["confirm"], message:"Passwords do not match" });
type Form = z.infer<typeof schema>;

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [remember, setRemember] = useState(false);

  const { control, handleSubmit, formState:{ isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema), defaultValues:{ name:"", email:"", password:"", confirm:"" } });

  const [createUser, { isLoading }] = useCreateUserMutation();

  const onSubmit = async (data: Form) => {
    try {
      const u = await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      // ✅ "מחובר" באפליקציה – שומרים ב-Redux
      dispatch(setUser({ id: u._id, name: u.name, email: u.email }));
      // אם בהמשך יהיה JWT מהשרת, נשמור כאן: dispatch(setToken(token)) וגם נתחשב ב-remember.

      // ✅ נכנסים ישר לעמוד המוצרים
      router.replace("/product"); // אם המסך נקרא אחרת – שנה לנתיב המתאים (למשל "/home")
    } catch (e: any) {
      const msg = e?.data?.message || e?.error || "Could not create account";
      alert(msg);
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:"#ffffffff" }}>
      <View style={s.page}>
        <Ionicons name="arrow-back" size={22} onPress={()=>router.back()} style={s.back} />
        <Logo sizeMultiplier={0.5} textScale={0.2} />
        <Text style={s.title}>Sign Up</Text>

        <Controller name="name" control={control} render={({ field:{ value, onChange } })=>(
          <TextField value={value} onChangeText={onChange} placeholder="Name" />
        )}/>
        <Controller name="email" control={control} render={({ field:{ value, onChange } })=>(
          <TextField value={value} onChangeText={onChange} placeholder="Email" keyboardType="email-address" />
        )}/>
        <Controller name="password" control={control} render={({ field:{ value, onChange } })=>(
          <TextField value={value} onChangeText={onChange} placeholder="Password" secure />
        )}/>
        <Controller name="confirm" control={control} render={({ field:{ value, onChange } })=>(
          <TextField value={value} onChangeText={onChange} placeholder="Confirm Password" secure />
        )}/>

        <Button
          title={isSubmitting || isLoading ? "..." : "Sign Up"}
          onPress={handleSubmit(onSubmit)}
        />
        {(isSubmitting || isLoading) && <ActivityIndicator style={{ marginTop:8 }} />}

        <Text style={s.switch}>Already have an account? <Link href="/sign-in">Sign In</Link></Text>

        <View style={s.remember}>
          <Text style={{ color:"#6B7280" }}>remember me</Text>
          <Checkbox value={remember} onValueChange={setRemember} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page:{ flex:1, padding:20, gap:12, justifyContent:"center" },
  back:{ position:"absolute", top:8, left:8 },
  title:{ fontSize:26, fontWeight:"800", textAlign:"center", marginTop:6, marginBottom:8 },
  switch:{ textAlign:"center", marginTop:8, color:"#111827" },
  remember:{ flexDirection:"row", justifyContent:"center", alignItems:"center", gap:10, marginTop:10 }
});
