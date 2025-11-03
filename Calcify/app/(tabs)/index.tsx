import { Text, View } from "react-native";
import SearchBar from "@/components/searchbar";
import ScreenWrapper from "@/components/screenwrapper";

export default function Index() {
  return (
    <ScreenWrapper>
      <View
      className="flex-1 justify-center items-center p-4 mt-10"
      >
      <Text
        className="text-4xl font-bold text-[#000000] mb-6"
      >
        Welcome to Calcify
      </Text>
      <Text
        className="text-lg text-[#000000] "
      >
        Select the operation you want to perform:
      </Text>
      <Text
        className="text-lg text-[#000000] mb-4"
      >
      </Text>
      <SearchBar />
      </View>
  </ScreenWrapper>
);
}

