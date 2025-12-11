/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import {Avatar, Box, Grid, useToast} from "@chakra-ui/react";

// Custom components
import Banner from "views/admin/profile/components/Banner";
import General from "views/admin/profile/components/General";

// Assets
import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/avatars/avatar4.png";
import React, {useRef, useState, useEffect} from "react";
import axios from "axios";
import {useAuthStore} from "stores/useAuthStore";


export default function Overview() {


    const abortRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuthStore();

    const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";


    const fetchProfile = async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const token = localStorage.getItem("access_token");
        if (!token) {
            setProfile(null);
            setError("No estás autenticado. Inicia sesión.");
            return;
        }

        try {

            const res = await axios.get(`${API_BASE}/api/users/profile/`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortRef.current.signal,
            });

            setProfile(res.data); // res.data = { user: {...}, profile: {...} }
            setError("");
        } catch (err) {
            if (!axios.isCancel(err)) {
                const msg = err.response?.data?.detail || "Error cargando perfil";
                setError(msg);
                setProfile(null);
                toast({
                    title: "Error de Carga",
                    description: msg,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // ==== UPDATE PROFILE ====
    const updateProfile = async (newUsername) => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await axios.patch(
                `${API_BASE}/api/users/profile/`,
                {
                        username: newUsername,
                    },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProfile(res.data);
            setUser(res.data);

            toast({
                title: "Perfil actualizado",
                status: "success",
            });

        } catch (err) {
            const msg = err.response?.data?.detail || "No se pudo actualizar el perfil";
            toast({
                title: "Error",
                description: msg,
                status: "error",
            });
        }
    };

    // ==== CHANGE PASSWORD ====
    const changePassword = async (oldPassword, newPassword) => {
        const token = localStorage.getItem("access_token");

        try {
            await axios.post(
                `${API_BASE}/api/users/profile/change-password/`,
                { old_password: oldPassword, new_password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: "Contraseña cambiada",
                status: "success",
            });

        } catch (err) {
            const msg =
                err.response?.data?.detail ||
                err.response?.data?.old_password ||
                "No se pudo cambiar la contraseña";

            toast({
                title: "Error",
                description: Array.isArray(msg) ? msg[0] : msg,
                status: "error",
            });
        }
    };


  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Main Fields */}
      <Grid
        templateColumns={{
          base: "1fr",
          lg: "1.34fr 1fr 1.62fr",
        }}
        templateRows={{
          base: "repeat(3, 1fr)",
          lg: "1fr",
        }}
        gap={{ base: "20px", xl: "20px" }}>
        <Banner
          gridArea='1 / 1 / 2 / 2'
          banner={banner}
          name={profile?.username || "Invitado"}
          role={profile?.profile?.role || ""}
          dob={new Date(profile?.profile?.created_at).toLocaleDateString() || ""}
        />
      <General
          gridArea='1 / 2 / 1 / 4'
          profile={profile}
          onUpdate={updateProfile}
          onChangePassword={changePassword}
      />
      </Grid>
    </Box>
  );
}
