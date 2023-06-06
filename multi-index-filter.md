a composite index of each property to filter by, sorted by each index to sort by.

sorting indexes, time/salary, but can also use buckets to make those properties filterable if the other property is used to actually sort. Region buckets can also be used for distance filtering.

Optional: For filtering I could also provide a list of values the filter property could be for generating ui, though if DISTINCT operation is supported by database that can be used

Optional: to allow multiple values for a filter, use a k-way merge of the values of that feed into the k-wise intersection/filter

Optional: use buffers 

I need to be able to for each index have a crawler that supports "Peek", "Next", and "Jump". 


crawler contains current sort value
list of objects at that value
count of objects in that list
and i of current position in that list
(could use max and offset to get sub-list of that list of objects for a given sort value)


Peek returns the object at the reference, ie `listOfObjects[i]`

Next moves to the next object in the sorted index,
Specifically; Next increases i, unless i = count of objects in list, in which case jump tp first > current sort value, take note of the sort value of the returned objects and set the current sort value to such and reset i to 0, and of course use the returned objects as new list of objects

jump takes a value, then finds the first object in the index greater than or equal to that value (lesser than or equal, if descending)


to do a k-wise intersection for a specific range sorted, the intersection being a set of filter properties(lets assume we are doing a descending sort):

set a crawler for each index of of the filter properties for the property filtered for. 

You have a set of crawlers with all pointing at objects based on their peek, if the object they all are pointed towards are the same, that object has all the desired properties and is the next highest object with those properties and can be pushed onto the ordered output. Then call "Next" on each crawler.

If all the crawlers are not pointing at the same object, then find the crawlers who's object has the lowest sort value (you could use a heap or something to make that more efficient). Then call jump on all the crawlers that aren't pointing at the same object with the lowest sort value, with the lowest sort value.

repeat until the desired amount of outputs is filled or one of the indexes runs out.


Speed-up:

iterate through the crawlers, if the value is not the same as last, jump to value of last, use that as next highest value

keep track of how many have had the same value, if that is the same as the number of crawlers, then that value is tied to the max

Value can be thought of as Sort Value concatenated with id, since every id is distinct, every value is distinct

saves time because a jump on the next crawler could create another highest value, so might as well use that for further jumps going forward


Total max computation time complexity is N_r * (X * Log(N_mit))

Where N_r is the amount of objects desired to be returned, N_mit is the max items in any index, and X is the amount of indexes being crawled or properties being filtered by.


Possible speedups through modifying existing list, when filtering is changed? Otherwise it would require doing the whole thing over again.

if another filter is added, then use the existing set and that set and do a k-wise intersection

if a filter is removed?
You know that the only objects that could be added are the objects that have a value of the filtered property not the previously filtered for value, if derive that as a set and do a k-wise intersection between that and all the other filters, you get the list of objects to add. 


If a single object is added to the database, it's properties could be checked to see if it fulfills the filter in which case it would be added and sorted to the filtered output too.

if a range of objects are added, some degree of pre-indexing could be done for that set in isolation, then a k-wise intersection of the filtered properties could be performed on that set and the output added to the filtered output

if a single object is removed from the database, it could be seen if it's in the filtered output, if so remove it.
likewise if a range is removed.

though if the object or objects being removed have a range outside the range of the filtered output of the sorted value, it does not need to be considered to be removed, because it is not in the set