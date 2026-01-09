import { Stack } from "expo-router";
//Stack represents which ever screen that you are in


export default function RootLayout() {
  return ( <>
    
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown:false}} />
     
    </Stack>
   </>)
   }
