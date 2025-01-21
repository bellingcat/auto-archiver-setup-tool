<template>

	<v-container class="pane-l mb-10">
		<v-card class="pa-3">

			<v-card-title class="text-center">
				Your <u v-if="items">{{ items.length }}</u> active archiver sheets
			</v-card-title>

			<v-data-table :headers="headers" item-key="name" no-data-text="No Active Sheets available" :items="items"
				:loading="loading" items-per-page="25" hover>
				<template v-slot:item.actions="{ item: data }">
					<v-btn color="teal-lighten-1" size="small" icon class="mx-2" :disabled="loading" rounded
						@click="archiveSheetNow(data.id)"><v-icon>mdi-archive-outline</v-icon>

						<v-tooltip activator="parent" location="left">Archive Now!</v-tooltip>
					</v-btn>
					<v-btn color="green-lighten-1" size="small" icon class="mx-2" rounded
						:href="`https://docs.google.com/spreadsheets/d/${data.id}`" :disabled="loading"
						target="_blank"><v-icon>mdi-open-in-new</v-icon>
						<v-tooltip activator="parent" location="left">Open in new tab</v-tooltip>
					</v-btn>
					<v-btn color="red-lighten-2" size="small" icon class="mx-2" :disabled="loading" rounded
						@click="removeSheet(data.id)"><v-icon>mdi-delete-outline</v-icon>
						<v-tooltip activator="parent" location="left">Stop archiving, does not delete the spreadsheet
							itself.</v-tooltip>
					</v-btn>
				</template>
				<template v-slot:item.name="{ item: data }">
					<strong :title="data.id">{{ data.name }}</strong>
				</template>
				<template v-slot:item.frequency="{ item: data }">
					<v-chip :color="data.frequency=='daily'?'teal-darken-3':'orange-darken-3'" class="bg-white" prepend-icon="mdi-archive-clock-outline" variant="outlined">
						{{ data.frequency }}
					</v-chip>
				</template>
			</v-data-table>
		</v-card>
	</v-container>

	<SnackBar :message="snackbarMessage" :show="snackbar" :color="snackbarColor" @update:show="snackbar = $event" />
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";

export default {
	name: "ManageSheets",
	components: {
		SnackBar,
	},
	props: {},
	data() {
		return {
			snackbar: false,
			snackbarMessage: "",
			snackbarColor: "red",

			loading: false,

			headers: [
				{ title: "Sheet Name", value: "name", sortable: true },
				{ title: "Group", value: "group_id", sortable: true },
				{ title: "Frequency", value: "frequency", sortable: true },
				{ title: "Created", value: "created_at", sortable: true },
				{ title: "Last Archived", value: "last_archived_at", sortable: true },
				{ title: 'Actions', value: "actions", align: 'center' },
			],

		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		items() {
			return this.$store.state.sheets;
		},
	},
	methods: {
		showSnackbar(message, color = "red") {
			this.snackbarMessage = message;
			this.snackbarColor = color;
			this.snackbar = true;
		},
		archiveSheetNow(sheetId) {
			this.loading = true;
			fetch(`${this.$store.state.API_ENDPOINT}/sheet/${sheetId}/archive`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.$store.state.access_token}`,
				}
			}).then(async response => {
				const res = await response.json();
				if (response.status === 201) {
					this.showSnackbar(`Sheet ${sheetId} is being archived with task id ${res?.id}!`, "green");
					this.$store.dispatch("getSheets");
				} else {
					throw new Error(JSON.stringify(res));
				}
			}).catch(error => {
				console.error("/sheet/mine ", error);
				this.showSnackbar(`Unable to trigger sheet archive: ${error.message}`);
			}).finally(() => {
				this.loading = false;
			});
		},
		removeSheet(sheetId) {
			this.loading = true;
			fetch(`${this.$store.state.API_ENDPOINT}/sheet/${sheetId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.$store.state.access_token}`,
				}
			}).then(async response => {
				const res = await response.json();
				if (response.status === 200 && res.deleted) {
					this.showSnackbar(`Sheet ${sheetId} has been removed!`, "green");
					this.$store.dispatch("getSheets");
				} else {
					throw new Error(JSON.stringify(res));
				}
			}).catch(error => {
				console.error("/sheet/mine ", error);
				this.showSnackbar(`Unable to remove sheet: ${error.message}`);
			}).finally(() => {
				this.loading = false;
			});
		},
	},
};
</script>