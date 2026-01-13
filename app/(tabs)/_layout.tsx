import { Tabs } from "expo-router";

//Took this from https://icons.expo.fyi/Index/FontAwesome/home, how you can
//get icons from expo
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';


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
    
    <Tabs screenOptions={{tabBarActiveTintColor: "red"}}>
      <Tabs.Screen name="index" options={{title:"Home", tabBarIcon:({color,size, focused}) => {return focused ? <AntDesign name="home" size={24} color="black" /> :  <FontAwesome name="home" size={size} color={color} />} }}/>
      <Tabs.Screen name="login" options={{title:"Login", tabBarIcon:() => (<Entypo name="login" size={24} color="black" />)}}/>
      {/* <Tabs.Screen name="auth"/> */}
    </Tabs>
   </>)
   };
