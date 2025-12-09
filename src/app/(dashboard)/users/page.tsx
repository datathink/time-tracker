import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/actions/user";
import { UserList } from "@/components/users/UserList";
//import { UserActions } from "@/components/users/UserActions";

export default async function UserManagementPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    redirect("/entries");
  }

  const usersResponse = await getUsers();
  const users = usersResponse.success ? usersResponse.data || [] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-10">User Management</h1>
      {/* <UserActions /> */}
      <UserList users={users} />
    </div>
  );
}
