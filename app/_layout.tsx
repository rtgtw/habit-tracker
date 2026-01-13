import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../lib/auth-context";
//Stack represents which ever screen that you are in

//Route guard, component that wraps around the layout and determine whether the user is logged in or not
//if not it will show the auth page

function RouteGuard({children}: {children: React.ReactNode}){
  //Use this to re-direct to diff parts of the app
  const router = useRouter();

  //segments allows us to know where in the app the user is, so we use the useSegments hook
  //Becuase we dont want to redirect to auth if they are already there
  const segments = useSegments();

   
  //We want to check if the user is authenticated using appwrite
  //useAuth is a helper hook we creaetd in auth-context that calls useContext for us,
  //And this file has access to it 
  const {user, isLoadingUser} = useAuth();


  //Runs when RouteGuard component renders
  //So basically we are creating a custom component, and all it does 
  //is literally force takes you to the /auth route no matter what
  //if isAuth is false

  //We want to redirect the user to the auth page if user == null
  useEffect( () => {
    console.log("Inside RouteGurd");
    //this lets us know if the user is already inside of the auth page
   
     for(const element of segments){
      console.log(`Element: ${element}`);
    }
  
    const inAuthGroup:boolean = segments[0] === "auth";
   console.log(`InAuthGroup: ${inAuthGroup}`);


    //If the user is not authenticated, and not inside the auth screen, redirect to auth
    //We also have to account if the user is done loading, thats the only time when
    //we want to enter 
    if(!user && !inAuthGroup && !isLoadingUser){
      console.log("!user, !inAuthGroup, !isLoading. Entered");
      router.replace("/auth");

      //If the user exists but not in the auth group then get them out of the auth page and send them home
    }else if(user && inAuthGroup && !isLoadingUser){
      console.log("User, inAuthGroup, !isLoaadding. Entered");
      router.replace("/");
    }
  },[user,segments]);
  //inside of the dependency array, we want to see if the user state changes
  //Also if segments change as well because the logic will be impacted

  //We just return the children because its a wrapper so everything inside of it
  return <>{children}</>
}



//Safe area provider makes the app compatible with different screens

export default function RootLayout() {
  return (<>
    <AuthProvider>
      <PaperProvider>
      <SafeAreaProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
      </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>


     {/* <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    </AuthProvider> */}
  </>)
}
