import { Tabs } from "expo-router";
//Stack represents which ever screen that you are in


export default function TabsLayout() {
  return ( <>
    
    <Tabs>
      <Tabs.Screen name="index" options={{title:"Home"}}/>
      <Tabs.Screen name="login" options={{title:"login"}}/>
    </Tabs>
   </>)
   }
