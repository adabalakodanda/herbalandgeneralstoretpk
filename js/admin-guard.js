import { supabase } from "./admin-supabase-config.js";

// Check whether the user is logged in

async function checkAdminAccess() {

    const {
        data: {
            session
        }
    } = await supabase.auth.getSession();


    // No login session

    if (!session) {

        window.location.href = "login.html";

        return;
    }


    // Check whether the logged-in user is an admin

    const {
        data: adminUser,
        error
    } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();


    if (error || !adminUser) {

        await supabase.auth.signOut();

        window.location.href = "login.html";

        return;
    }


    console.log("Admin access verified.");

}


checkAdminAccess();