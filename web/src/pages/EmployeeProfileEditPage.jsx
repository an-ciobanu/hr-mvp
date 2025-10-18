import ProfileEdit from "../components/Profile/ProfileEdit";
import { useParams } from "react-router-dom";

export default function EmployeeProfileEditPage() {
  const { userId } = useParams();
  return <ProfileEdit userId={userId} />;
}
