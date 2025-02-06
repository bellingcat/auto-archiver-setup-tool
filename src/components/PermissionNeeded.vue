<template>
	<v-alert color="orange" icon="mdi-information" class="text-center" style="font-size:x-large">
		To use the <strong>{{ feature }}</strong> feature, you need <strong>permission from Bellingcat's tech
			team</strong>.
		<br />
		You can ask for access via <a href="https://forms.gle/crqBXUtyZcbLhiRQ9" target="_blank">this form</a>.
		<br/>
		<small>
			<strong>NB: </strong>We do not allow law enforcement, military or intelligence agencies to use this tool.
		</small>
	</v-alert>
</template>

<script>
export default {
	name: 'PermissionNeeded',
	props: {
		feature: {
			type: String,
			required: false
		}
	}
}
</script>

<style scoped></style>