import { account, client, DATABASE_ID, databases, HABITS_COMPLETION_ID, HABITS_TABLE_ID, RealTimeResponse } from "@/lib/appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";
import { useAuth } from "../../lib/auth-context";
import { Habit, HabitCompletion } from "../types/database.type";
 
export default function Index() {

  const {user, signOut} = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();

  const swipableRef = useRef<{[key:string]: Swipeable | null}>({});



  const renderLeftActions = () => {
    return (
      <View style={styles.swipeActionLeft}>
        <MaterialCommunityIcons name="trash-can-outline" size={32} color={"#fff"} />
      </View>)
  };

  //call appwrite to delete db row entry
  //id is the id of the ROW (document ID)
  const handleDeleteHabit = async (id:string) => {

    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_TABLE_ID,id);
    } catch (error) {
      console.log(error);
    }
  }

  //id is the id of the ROW (document ID)
  //We want to insert the completion into the list of completed habits
  //We are creating a new ROW entry inside of habit_completion so we create a NEW id
  const handleCompleteHabit = async (id:string) => {

    //Make sure that the user exists
    if(!user || completedHabits?.includes(id)) return;

    try {

      const completed_at = new Date().toISOString()

      await databases.createDocument(DATABASE_ID,HABITS_COMPLETION_ID,ID.unique(), 
      {
        habit_id:id,
        user_id: user?.$id,
        completed_at

      });


      //Find method returns back the specific habit inside of this array
      const habit = habits?.find((habit) => habit?.$id === id);

      //If we dont find anything then just return
      if(!habit) return;

      await databases.updateDocument(DATABASE_ID, HABITS_TABLE_ID, id, {
        streak_count: ++habit.streak_count,
        last_completed: completed_at
      });

      console.log("COMPLETED HABIT, UPDATED DB");


    } catch (error) {
      console.log(error);
    }
  }

  //Boolean that just returns if the habit has been completed by checking the completedHabits array
  //with the habit ID
  //CompletedHabits is an array of IDs
  const isHabitComplete = (habitId:string) => {return completedHabits?.includes(habitId);}

  const renderRightActions = (habitId:string) => {

    // console.log(`Inside renderRightActions: isHabitComplete: ${isHabitComplete(habitId)}`);

    return (
      <View style={styles.swipeActionRight}>

        {isHabitComplete(habitId) ? (<Text style={{color:"#fff"}}>Completed!</Text>) : (<MaterialCommunityIcons name="check-circle-outline" size={32} color={"#fff"}/>)}
        
      </View>)
  };

  //Run fetchHabits everytime the user come back(re-renders) index.ts
  //Pass in user because if this changes then we should re-render

  useEffect( () => {
    console.log("Entered Use Effect");
  
    if(user){
      
    const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`;

    //Now we have to listen for real time updates/changes in the DB so we have to use
    //Appwrite's subscribe function, it subscribes to events that happen within the DB table
    //This triggers the listening, running habitSubscription(); stops the event listner
    const habitSubscription = client.subscribe(habitsChannel,
      (response:RealTimeResponse ) => {
        
        console.log("INSIDE HABIT SUBSCRIPTION");
        //We are listening to real time events on this Table, the response.event is an object which tells what type of operations
        //Account for them
        //Create operation
        // console.log(`Response Events:`);
        // console.log(response.events);
        if(response.events.includes("databases.*.collections.*.documents.*.create")){
          console.log("Entered CREATE");
          fetchHabits();
        }else if(response.events.includes("databases.*.collections.*.documents.*.update")){
            console.log("Entered UPDATE");
          fetchHabits();
        }else if(response.events.includes("databases.*.collections.*.documents.*.delete")){
            console.log("Entered DELETE");
          fetchHabits();
        }

        console.log("Exiting Subscribe!");
      }); 


      //Completions Channel
      const habitsCompletionChannel = `databases.${DATABASE_ID}.collections.${HABITS_COMPLETION_ID}.documents`;

    //Now we have to listen for real time updates/changes in the DB so we have to use
    //Appwrite's subscribe function, it subscribes to events that happen within the DB table
    //This triggers the listening, running habitSubscription(); stops the event listner
    const habitCompletionSubscription = client.subscribe(habitsCompletionChannel,
      (response:RealTimeResponse ) => {
        
        console.log("INSIDE HABIT SUBSCRIPTION");
        //We are listening to real time events on this Table, the response.event is an object which tells what type of operations
        //Account for them
        //Create operation
        // console.log(`Response Events:`);
        // console.log(response.events);
        if(response.events.includes("databases.*.collections.*.documents.*.create")){
          console.log("Entered CREATE");
          fetchTodayCompletitons();
        }

        console.log("Exiting Subscribe!");
      }); 
      //End Completions Channel



       fetchHabits();
       fetchTodayCompletitons();

       console.log("Leaving useEffect")

       //Clean up use effects to avoid memoy leaks
       return () =>{

        console.log("Inside CLEANUP");
        habitSubscription();
        habitCompletionSubscription();
       };  
    }
  },[user]);



  //fetch the habits
  const fetchHabits = async () => {
    try {
      const sessions = account.listSessions();

      // console.log(DATABASE_ID);
      // console.log(HABITS_TABLE_ID);
      // console.log(user?.$id);

      const response = await databases.listDocuments(
        DATABASE_ID, 
        HABITS_TABLE_ID,
        //?. == return unddefined if its not there
        //?? if a isnt there, return b
        [Query.equal("user_id", user?.$id ?? "")]
        //  [Query.equal("user_id", "6965a1ae001aa9cbcfbd")]
       );

       //The response will have more than just the rows, .documents just returns the rows
      //  console.log("full response  \n\n");
      //  console.log(response?.documents);
      //  console.log("end response  \n\n");
   
       
       setHabits(response.documents as unknown as Habit[]);

    } catch (error ) {
      console.log("entered error");
      console.error(error);
    }
  }

  const fetchTodayCompletitons = async () => {

    const today = new Date();
    today.setHours(0,0,0,0);

     try {
      const sessions = account.listSessions();

      const response = await databases.listDocuments(
        DATABASE_ID, 
        HABITS_COMPLETION_ID,
        //?. == return unddefined if its not there
        //?? if a isnt there, return b
        [Query.equal("user_id", user?.$id ?? ""), Query.greaterThanEqual("completed_at", today.toISOString())]
        //  [Query.equal("user_id", "6965a1ae001aa9cbcfbd")]
       );


       //Transformed this into an arry of just IDs
       const completions = response.documents as unknown as HabitCompletion[]
       setCompletedHabits(completions.map((completion) => completion.habit_id));

    } catch (error ) {
      console.log("entered error");
      console.error(error);
    }
  }


  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title} variant="headlineSmall"> Today's Habits</Text>
        <Button mode="text" onPress={signOut} icon="logout" textColor="#984eb7">Sign Out</Button>
      </View>
      

      <ScrollView showsHorizontalScrollIndicator={false}>
        {habits?.length === 0 ?
          (<View style={styles.emptyState}>
            <Text style={styles.emptyStateText}> Habits are empty! Add your first Habit</Text>
          </View>) :

          habits?.map((habit, key) => (
            <Swipeable ref={(ref) => {
                swipableRef.current[habit?.$id] = ref;
            }} 
            key={key}
            overshootLeft={false}
            overshootRight={false}
            renderLeftActions={renderLeftActions}
            renderRightActions={() => renderRightActions(habit?.$id)}
            onSwipeableOpen={ (direction) => {
              if(direction === "left"){
                handleDeleteHabit(habit?.$id);
              }else if (direction === "right"){
                handleCompleteHabit(habit?.$id);
                //We have to keep track of all the habits that are completed
              }

              swipableRef.current[habit.$id]?.close();
            }}>

              {/* This is how you conditionally add style, you create an array, when its true, the style on the right is the new one */}
              <Surface style={[styles.card, isHabitComplete(habit?.$id) && styles.cardCompleted]} elevation={0}  >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDescription}>{habit.description}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons name="fire" size={18} color={"#ff9800"} />
                      <Text style={styles.streakText}>{habit.streak_count} day streak</Text>
                    </View>

                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>{habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</Text>
                    </View>

                  </View>

                </View>
              </Surface>
            </Swipeable>
          ))}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding: 16,
    backgroundColor:"#f5f5f5"
  },

  header:{
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems:"center",
    marginBottom:24,
    
  },


  title:{
    fontWeight:"bold",
    color:"black"
  },

  card:{
    marginBottom:18,
    borderRadius:18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset:{ width:0, height:2},
    shadowOpacity: .18,
    shadowRadius: 1,
    elevation: 4
  },

  cardCompleted:{
    opacity:.6
  },

  cardContent:{
    padding: 20,

  },

  cardTitle:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:4,
    color:"black"
  },

  cardDescription:{
    fontSize:15,
    marginBottom:16,
    color:"#6c6c80"
  },

  cardFooter:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  streakBadge:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#fff3e0",
    borderRadius:12,
    paddingHorizontal:10,
    paddingVertical:4
  },

  streakText:{
    marginLeft:6,
    color:"#ff9800",
    fontWeight:"bold",
    fontSize:14
  },


  frequencyBadge:{

    backgroundColor:"#ede7f6",
    borderRadius:12,
    paddingHorizontal:12,
    paddingVertical:4
  },
  
  frequencyText:{
    color:"#7c4dff",
    fontWeight:"bold",
    fontSize:14,
  },

  emptyState:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  emptyStateText:{
    color:"#666666"
  },

  swipeActionLeft:{
    flex:1,
    justifyContent:"center",
    alignItems:"flex-start",
    backgroundColor:"#e53935",
    borderRadius:18,
    marginTop:2,
    paddingLeft:16,
    marginBottom:18

  },
  swipeActionRight:{
     flex:1,
    justifyContent:"center",
    alignItems:"flex-end",
    backgroundColor:"#4caf50",
    borderRadius:18,
    marginTop:2,
    paddingRight:16,
    marginBottom:18
  }
  



  
});
