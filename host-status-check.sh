sed -E 's/^\[([^]]+)\].*/\1/' resultsubfinder.txt | sort -u | xargs -P 20 -I{} sh -c 'echo "$(curl -sk -o /dev/null -m 10 -w "%{http_code}" https://{}) {}"' | sort > status.txt
