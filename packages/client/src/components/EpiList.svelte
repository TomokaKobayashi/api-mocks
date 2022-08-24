<script>
  import { OrderedList, ListItem } from "carbon-components-svelte";
  import { onMount } from 'svelte';

  let endpointList = [];

  const getEndpoints = async () => {
		const serverURL = "/control/endpoints";
		const response = await fetch(
			serverURL,
			{
				method: 'GET',
				mode: 'cors',
				credentials: 'omit'
			}
		);
		return await response.json();    
  }

	onMount(async ()=>{
		const epList = await getEndpoints();
		endpointList = [...epList.endpoints];
	});

</script>	


<OrderedList>
	<h1>Endpoints</h1>
	{#each endpointList as endpoint}
		<ListItem>{endpoint.pattern}</ListItem>
	{/each}
</OrderedList>
