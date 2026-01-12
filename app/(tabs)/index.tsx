import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.view}
    >
      <Text>Edit app/index.tsx to edit this .</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    width: 75,
    height: 20,
    backgroundColor: "coral",
    borderRadius: 8,
    textAlign: "center"
  }
});
