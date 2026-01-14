import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useAuth } from "./../lib/auth-context";

export default function AuthScreen(){

    //Create a state to check to see if the user is trying to sign up
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    const theme = useTheme();

    //UseRouter allows you to navigate to different pages (files) since expo is file-based routing
    const router = useRouter();

    const {signIn, signUp} = useAuth();


    
    
    
  
    //The Callback function is useState always passes the prev state in as a parameter
    //So you can use that to check the state
    //You dont have to pass in a function to the useState setter, but when you do, it will
    //Pass you the previous state as a parameter which you can use
    const handleSwitchMode = () => {
        setIsSignUp((prev) => {console.log(prev); return !prev} );
    }


    //Handles auth when user hits sign up or sign in
    //This actually needs to be async because its going to call the appwrite API
    //so you dont know when its going to finish so its async because the appwrite function has to be an await
    const handleAuth = async () => {
        //1. We have to keep track of what the user is typing through state
        //2. We have to make sure both email and password are filled in before trying to use appwrite api
        if(!email || !pass){
            setError("Please fill in all fields.");
            return;
        };

        //Check password length
        if(pass.length < 8){
            setError("Password needs to be longer than 8 characters long.");
            return;
        }
       

        //Reset it when the user makes the revisions
        setError(null);


        //if sign up is true, call the sign up function else call the sign in function
        if(isSignUp){

            //errors get returned, if nothing is returned then its successful
           const error =  await signUp(email, pass);
           if(error){
            setError(error);
            return
           }
        }else {
           const error = await signIn(email,pass);

            if(error){
            setError(error);
            return
           }

           //if successful redirect the user to the home page
           router.replace("/");

         
            
        }

    }

    const handleEmail = (text: string) => {
        //Take the text that is passed in from onChangeText, and change the state of 
        //email with setEmail, and the value should be the state email
        if(text.includes(" ")){console.log("Error, no spaces"); return}

        console.log(text);
        setEmail(text);
    }

    const handlePass = (text: string) => {
        //Same thing as email
        console.log(text);
        setPass(text);
    }


    return (

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}>

            <View style={styles.content}>
            <Text style={styles.title} variant="headlineMedium"> {isSignUp ? "Create Account!" : "Sign In"}</Text>

            <TextInput label="email" 
            autoCapitalize="none"
             keyboardType="email-address"
             placeholder="email@gmail.com"
             mode="outlined"
             style={styles.input}
             value={email}
             onChangeText={handleEmail}
                    theme={{
                        colors: {
                            background: '#f5f5f5',
                            surface: 'white',         // Paper surface color
                            // primary: '#000000',       // focused outline + label
                            // onSurfaceVariant: '#000000', // unfocused label
                            // placeholder: '#000000',   // placeholder text
                        }
                    }}
            textColor="black"
             />

              <TextInput label="password" 
            autoCapitalize="none"
             placeholder="Your password"
             mode="outlined"
             style={styles.input}
             value={pass}
             onChangeText={handlePass}
             secureTextEntry
               theme={{
                        colors: {
                            background: '#f5f5f5',
                            surface: 'white',         // Paper surface color
                            // primary: '#000000',       // focused outline + label
                            // onSurfaceVariant: '#000000', // unfocused label
                        }
                    }}
            textColor="black"
             />

            {error && (<Text style={{color:theme.colors.error}}>{error}</Text>)}

            <Button mode="contained" style={styles.button} onPress={handleAuth}> {isSignUp ? "Sign Up" : "Sign In"}</Button>
            <Button mode="text" style={styles.switchModeButton} onPress={handleSwitchMode}> {isSignUp ? "Already have an Account? Sign In" : "Dont have an Account? Sign Up"}</Button>
            </View>
        </KeyboardAvoidingView>
    )
    
}



const styles = StyleSheet.create({
    content: {
       flex:1,
       padding: 16,
       justifyContent:"center"
    },
    container:{
        flex:1,
        backgroundColor:"#f5f5f5"
    },
    title:{
        textAlign:"center",
        marginBottom:15,
        color:'black'
    },
    input:{
        marginBottom:15,
        // backgroundColor:"#ffffff"
    },
    button:{
        marginTop:8
    },
    switchModeButton:{
        marginTop:16
    }
})