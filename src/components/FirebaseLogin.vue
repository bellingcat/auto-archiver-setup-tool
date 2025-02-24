<template>
	<section id="firebaseui-auth-container"></section>
</template>

<script>
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import "firebase/compat/auth";
import { firebaseConfig } from "@/firebase.js";

export default {
	name: "FirebaseLogin",
	mounted() {
		console.log(`user after mount`, this.$store.state.user);
		firebase.initializeApp(firebaseConfig);


		let uiConfig = {
			signInFlow: 'popup',
			signInSuccessUrl: "/",
			signInOptions: [
				{
					provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					scopes: [
						"https://www.googleapis.com/auth/drive.file",
						"https://www.googleapis.com/auth/userinfo.profile",
						"https://www.googleapis.com/auth/userinfo.email"
					],
					customParameters: { prompt: "select_account" },
				},
				{
					provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
					signInMethod:
						firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
				},
			],
			callbacks: {
				signInSuccessWithAuthResult: function (authResult, redirectUrl) {
					console.log("authResult", authResult);
					console.log("redirectUrl", redirectUrl);
					return true;
				},
			},
		};

		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.$store.commit("setLoadingUserState", true);
				this.$store.commit("setUser", user);
				user.getIdToken().then((token) => {
					this.$store.commit("setAccessToken", token);
					this.$store.dispatch("checkActiveUser");
					this.$store.dispatch("checkUserPermissions");
					this.$store.dispatch("checkUserUsage");
				});
			} else {
				let ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

				firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
					console.log("Auth persistence set to LOCAL");
				});

				ui.start("#firebaseui-auth-container", uiConfig);
			}
		});

	},
};
</script>

<style>
#firebaseui-auth-container {
	margin-top: 1em;
}
</style>