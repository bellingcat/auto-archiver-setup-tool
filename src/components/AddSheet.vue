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
			<v-select v-model="frequency" label="Archive frequency" :items="availableFrequencies"
				:disabled="!availableFrequencies?.length" required density="comfortable"></v-select>
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
			<v-btn v-if="actionIsCreate" color="teal" size="large" :disabled="!requiredData"
				@click="createSheet">Create</v-btn>
			<v-btn v-if="!actionIsCreate" color="teal" size="large" :disabled="!requiredDataExisting"
				@click="addExistingSheet">Add Existing Sheet</v-btn>
		</v-col>
		<v-col cols="12" sm="12" class="pt-0" v-if="group != 'please select'">
			<span>
				<span class="text-medium-emphasis mb-1">
					<strong>{{ group }}</strong>: {{ groupPermissions.description }}
				</span>
				<ul>
					<li>
						Active sheets:
						<strong>{{ groupUsage.total_sheets || 0 }}</strong> out of
						<strong>{{ displayPermissionValue(groupPermissions?.max_sheets, "") }}</strong>
						<v-chip v-if="maxedOutGroupQuota" label class="ml-2" color="red" density="comfortable"
							size="small">maxed out</v-chip>
					</li>
					<li>Monthly URLs: <strong>{{ groupUsage.monthly_urls || 0 }}</strong> out of <strong>{{
						displayPermissionValue(groupPermissions?.max_monthly_urls, " URLs") }}</strong></li>
					<li>Monthly MBs: <strong>{{ groupUsage.monthly_mbs || 0 }}</strong> out of <strong>{{
						displayPermissionValue(groupPermissions?.max_monthly_mbs, " MBs") }}</strong></li>
					<li>We will store archives for: <strong>{{
						displayPermissionValue(groupPermissions?.max_archive_lifespan_months, " months") }}</strong>
					</li>
					<li>You <strong>{{ groupPermissions?.manually_trigger_sheet ? "can" : "cannot" }}</strong> manually
						trigger sheets in this group. </li>
				</ul>
				<p v-if="!actionIsCreate" class="text-medium-emphasis mt-2">
					<strong>NOTE:</strong> invite <a :href="`mailto:${groupPermissions?.service_account_email}`">{{
						groupPermissions?.service_account_email }}</a> to the sheet, see further instructions below.
				</p>
			</span>
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

			sheetName: ``.trim(),
			sheetUrlId: ``,

			group: "please select",

			frequency: "please select",

			newSheetId: "",
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		requiredData() {
			return this.sheetName && this.availableGroups?.some(g => g.value === this.group) && this.availableFrequencies?.some(f => f === this.frequency) && !this.maxedOutGroupQuota;
		},
		requiredDataExisting() {
			return this.sheetName && this.spreadsheetId && this.availableGroups?.some(g => g.value === this.group) && this.availableFrequencies?.some(f => f === this.frequency) && !this.maxedOutGroupQuota;
		},
		availableGroups() {
			const permissions = this.$store.state.user?.permissions || {};
			return Object.keys(permissions)
				.filter(group => group !== "all" && permissions[group].archive_sheet)
				.map(g => ({ title: g, value: g }));
		},
		availableFrequencies() {
			return this.$store.state.user?.permissions?.[this.group]?.sheet_frequency || [];
		},
		groupPermissions() {
			return this.$store.state.user?.permissions?.[this.group] || {};
		},
		groupUsage() {
			return this.$store.state.user?.usage?.["groups"]?.[this.group] || {};
		},
		maxedOutGroupQuota() {
			if (this.groupPermissions?.archive_sheet === false) return true;
			if (this.groupPermissions.max_sheets === -1) return false;
			return this.groupUsage.total_sheets >= this.groupPermissions.max_sheets;
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
			this.$store.dispatch("createSheet", { name: this.sheetName, service_account_email: this.groupPermissions.service_account_email }).then((res) => {
				this.$store.dispatch("checkUserUsage");
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
					this.$store.dispatch("getSheets");
					this.$store.dispatch("checkUserUsage");
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
		},
		displayPermissionValue(value, extraWord) {
			if (value === undefined) { return "not set"; }
			return value == -1 ? "no limit" : value + extraWord;
		}
	},
};
</script>