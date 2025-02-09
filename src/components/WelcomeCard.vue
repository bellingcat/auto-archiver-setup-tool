<template>
	<v-container class="pane" fluid v-if="!user || !user.active">
		<v-row>
			<v-col>
				<v-card>
					<v-card-text>
						<v-card-title class="text-center">
							Welcome to the Auto Archiver Setup Tool
						</v-card-title>
						<v-alert color="#f2d97c" icon="mdi-alert">
							This is a prototype demo service provided on a
							best-effort basis. <br />Do not use for mission critical or sensitive
							data.
						</v-alert>
						<p>
							This tool can be used to archive digital content via single URL or Google Sheets, you can
							also search for
							archived content.
						</p>
						<div class="text-center">
							<v-btn v-if="!user && !loadingUserState" @click="$store.dispatch('signin')" size="large">Sign In</v-btn>
						</div>
						<v-container v-if="loadingUserState" class="pane" style="text-align: center;">
							<v-row justify="center">
								<v-col cols="12">
									<v-progress-circular color="teal" indeterminate :size="82"
										:width="7"></v-progress-circular>
								</v-col>
								<v-col cols="12">
									<h4>loading...</h4>
								</v-col>
							</v-row>
						</v-container>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	name: 'WelcomeCard',
	props: {
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		loadingUserState() {
			return this.$store.state?.loadingUserState;
		}
	}
}
</script>

<style scoped></style>