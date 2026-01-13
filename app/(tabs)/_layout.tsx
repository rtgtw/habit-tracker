import { Tabs } from "expo-router";

//Took this from https://icons.expo.fyi/Index/FontAwesome/home, how you can
//get icons from expo
import { MaterialCommunityIcons } from "@expo/vector-icons";


//Tab represents the tabs at the bottom of the screen to click through 






//In order to use this component <FontAwesome name="home" size={24} color="black" />
// You have to pass it into Tabs.Screen as an options named tabBarIcon:
//But you cannot do it directly, you have to use an anonymous function to render JSX
//Almost the equiv to creating your own component but just doing it on the fly

export default function TabsLayout() {

  //   const router = useRouter();
  //   const isAuth = false;

  // useEffect( () => {
  //   if(!isAuth){
  //     router.replace("/auth");
  //   }

  //   console.log(`Entered: ${isAuth}`)

  // }, [isAuth]);
    

  return ( <>
    
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: "#f5f5f5" },
      headerShadowVisible: false,
      tabBarStyle: { 
        backgroundColor: "#f5f5f5",
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0
       },
       tabBarActiveTintColor: "#6200ee",
       tabBarInactiveTintColor: "#666666"
    

    }}>

      <Tabs.Screen
        name="index"
        options={{
          title: "Todays Habits", tabBarIcon: ({ color, size, focused }) => { return (<MaterialCommunityIcons name="calendar-today"  size={size} color={color}/>) }
        }} />

      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks", tabBarIcon: ({color,size, focused}) => {return (<MaterialCommunityIcons name="chart-line" size={size} color={color} />)}
        }} />


        <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit", tabBarIcon: ({color,size, focused}) => {return (<MaterialCommunityIcons name="plus-circle" size={size} color={color} />)}
        }} />
     




    </Tabs>
  </>)
};
