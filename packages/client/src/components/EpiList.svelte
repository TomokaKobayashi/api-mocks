<script>
  import { OrderedList, ListItem } from "carbon-components-svelte";
  import { onMount } from 'svelte';

  let endpointList = [];

  const getEndpoints = async () => {
		const serverURL = "";
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


</script>


<OrderedList>
  <ListItem>Ordered list item</ListItem>
  <ListItem>Ordered list item</ListItem>
  <ListItem>Ordered list item</ListItem>
</OrderedList>
