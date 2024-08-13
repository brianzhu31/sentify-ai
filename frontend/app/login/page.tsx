import LoginForm from "./components/LoginForm";
import { login, signup } from "./actions";

export default function Login() {
    return (
        <div className="flex-1 flex min-h-screen justify-center items-center">
            <LoginForm />
        </div>
        
    );
}
