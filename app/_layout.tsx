import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth-context";
//Stack represents which ever screen that you are in


//Route guard, component that wraps around the layout and determine whether the user is logged in or not
//if not it will show the auth page

//

// function RouteGuard({children}: {children: React.ReactNode}){

//   //Use this to re-direct to diff parts of the app
//   const router = useRouter();

//   const isAuth = false;

//   //Runs when RouteGuard component renders
//   useEffect( () => {
//     if(!isAuth){
//       router.replace("/auth");
//     }
//   });


//   //We just return the children because its a wrapper so everything inside of it
//   //
//   return <>{children}</>

// }

export default function RootLayout() {
  return ( <>

    <AuthProvider>
     <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
      
   </>)
   }
