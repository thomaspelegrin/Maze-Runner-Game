/** Class for Priority Queue datastructure.
 */
class PriorityQueue extends Heap {
    /**
     * Puts the specified value in the queue.
     * @param {number} priority The priority of the value. A smaller value here
     *     means a higher priority.
     * @param {VALUE} value The value.
     */
    enqueue( priority, value ) {
        this.insert( priority, value );
    }

    /** Retrieves and removes the head of this queue.
     * @return {VALUE} The element at the head of this queue. Returns undefined if
     *     the queue is empty.
     */
    dequeue() {
        return this.remove();
    }
}
