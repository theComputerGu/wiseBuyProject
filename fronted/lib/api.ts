import axios from "axios";
import { Platform } from "react-native";


const baseURL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"       // Android Emulator
    : "http://localhost:3000";     // Web/iOS Simulator במחשב

export const api = axios.create({ baseURL, timeout: 10000 });