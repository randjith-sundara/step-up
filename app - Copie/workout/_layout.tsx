import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';

export default function WorkoutLayout() {
    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: Colors.dark.background },
            headerTintColor: Colors.dark.text,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false, // Remove bottom border/shadow
        }}>
            <Stack.Screen name="create" options={{ headerShown: false }} />
            <Stack.Screen name="active/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
