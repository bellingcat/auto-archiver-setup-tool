<template>
	<v-row class="my-2">
		<v-col cols="12" sm="12" class="ma-0 pb-0">
			<v-text-field label="Google Sheets document name" v-model="sheetName" required
				density="comfortable"></v-text-field>
		</v-col>
		<v-col v-if="!actionIsCreate" cols="12" sm="12" class="ma-0 py-0">
			<v-text-field label="Existing Google Sheet URL/ID" v-model="sheetUrlId" required density="comfortable">
			</v-text-field>
		</v-col>
		<v-col cols="6" sm="6" class="ma-0 py-0">
			<v-select v-model="group" label="Group" :items="availableGroups" required density="comfortable"></v-select>
		</v-col>
		<v-col cols="6" sm="6" class="ma-0 py-0">
			<v-select v-model="frequency" label="Archive frequency" :items="availableFrequencies" required
				density="comfortable"></v-select>
		</v-col>
		<v-col cols="12" sm="12" class="text-right pt-0">
			<small v-if="spreadsheetId">Detected Spreadsheet id: <code>{{ spreadsheetId }}</code></small>
		</v-col>
		<v-col cols="12" sm="12" class="text-right pt-0">
			<v-progress-circular color="green" indeterminate class="mx-6" v-if="loading"></v-progress-circular>
			<v-btn v-if="newSheetId" :href="`https://docs.google.com/spreadsheets/d/${newSheetId}`"
				append-icon="mdi-open-in-new" :title="newSheetId" target="_blank" color="success" class="mx-2"
				size="large">
				open sheet
			</v-btn>
			<v-btn v-if="actionIsCreate" color="primary" size="large" :disabled="!requiredData"
				@click="createSheet">Create</v-btn>
			<v-btn v-if="!actionIsCreate" color="primary" size="large" :disabled="!requiredDataExisting"
				@click="addExistingSheet">Add Existing Sheet</v-btn>
		</v-col>

	</v-row>

	<SnackBar :message="snackbarMessage" :show="snackbar" :color="snackbarColor" @update:show="snackbar = $event" />
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";

export default {
	name: "AddSheet",
	components: {
		SnackBar,
	},
	props: {
		actionIsCreate: {
			type: Boolean,
			required: true,
			default: true,
		}
	},
	data() {
		return {
			snackbar: false,
			snackbarMessage: "",
			snackbarColor: "red",
			loading: false,

			tab: '',
			items: ['Create new Archiver Sheet', 'Add existing Sheets'],

			sheetName: ``.trim(),
			sheetUrlId: ``,

			group: "please select",

			availableFrequencies: ["daily", "hourly"].map(f => ({ title: f, value: f })),
			frequency: "daily",

			newSheetId: "",
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		requiredData() {
			return this.sheetName && this.availableGroups?.some(g => g.value === this.group) && this.availableFrequencies?.some(f => f.value === this.frequency);
		},
		requiredDataExisting() {
			return this.sheetName && this.spreadsheetId && this.availableGroups?.some(g => g.value === this.group) && this.availableFrequencies?.some(f => f.value === this.frequency);
		},
		availableGroups() {
			return (this.$store.state.user?.groups || []).map(g => ({ title: g, value: g }));
		},
		spreadsheetId() {
			if (
				this.sheetUrlId.startsWith("http") &&
				this.sheetUrlId.split("/").length >= 6
			) {
				return this.sheetUrlId.split("/")[5];
			}
			return this.sheetUrlId;
		},
	},
	watch: {
	},
	methods: {
		showSnackbar(message, color = "red") {
			this.snackbarMessage = message;
			this.snackbarColor = color;
			this.snackbar = true;
		},
		createSheet() {
			if (!this.requiredData) return;
			if (this.loading) return;

			this.loading = true;
			this.newSheetId = "";
			this.$store.dispatch("add", this.sheetName).then((res) => {
				console.log(res);
				if (!res.success) throw new Error(res.result);
				this.newSheetId = res.result;
				this.addSheetToAPI(this.newSheetId);
			}).catch((error) => {
				console.error(error);
				this.showSnackbar(`Unable to create sheet: ${error.message}`);
				this.loading = false;
			});
		},
		addExistingSheet() {
			if (!this.requiredDataExisting) return;
			if (this.loading) return;
			this.loading = true;
			this.addSheetToAPI(this.spreadsheetId);
		},
		addSheetToAPI(sheetId) {
			fetch(`${this.$store.state.API_ENDPOINT}/sheet/create`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.$store.state.access_token}`,
				},
				body: JSON.stringify({
					id: sheetId,
					name: this.sheetName,
					group_id: this.group,
					frequency: this.frequency,
				})
			}).then(async response => {
				const j = await response.json();
				if (response.status === 201) {
					this.showSnackbar(`Sheet created successfully!`, "green");
					// this.$store.dispatch("refreshDocs"); //TODO: implement this
				} else {
					throw new Error(JSON.stringify(j));
				}
			}).catch(error => {
				console.error("/sheet/create ", error);
				this.showSnackbar(`Unable to save sheet to DB: ${error.message}`);
			}).finally(() => {
				this.loading = false;
				this.sheetName = "";
				this.sheetUrlId = "";
				this.group = "please select";
			});
		}
	},
};
</script>