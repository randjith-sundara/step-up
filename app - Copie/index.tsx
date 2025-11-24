import { Redirect } from 'expo-router';

export default function Index() {
    // Mock auth check - redirect to login
    // In real app, check token/context here
    const isAuthenticated = false;

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return <Redirect href="/(tabs)" />;
}
